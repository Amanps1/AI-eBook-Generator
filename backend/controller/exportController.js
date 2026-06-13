const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  ImageRun,
} = require("docx");
const Book = require("../models/Book");
const fs = require("fs");
const path = require("path");
const markdownIt = require("markdown-it");
const PDFDocument = require("pdfkit");

const md = new markdownIt();


const DOCX_STYLES = {
  fonts: {
    body: "Charter",
    heading: "Inter",
  },
  sizes: {
    title: 32,
    subtitle: 20,
    author: 18,
    ChapterTitle: 24,
    h1: 20,
    h2: 18,
    h3: 16,
    body: 12,
  },
  spacing: {
    paragraphBefore: 200,
    paragraphAfter: 200,
    chapterBefore: 400,
    chapterAfter: 300,
    headingBefore: 300,
    headingAfter: 150,
  },
};

//Helper: Process inline content (bold, italic, etc.)

const processInlineContent = (children) => {
    const textRuns=[];
    let currentFormatting={
        bold:false,
        italic: false
    }

    let textBuffer="";

    const flushText=()=>{
        if(textBuffer.trim()){
            textRuns.push(
                new TextRun({
                    text:textBuffer,
                    bold: currentFormatting.bold,
                    italics: currentFormatting.italic,
                    font:DOCX_STYLES.fonts.body,
                    size:DOCX_STYLES.sizes.body * 2
                })
            )
            textBuffer="";
        }
    }
    children.forEach((child)=>{
        if(child.type==="text"){
            textBuffer+=child.content;
        }
        else if(child.type==="em_open"){
            flushText();
            currentFormatting.italic=true;
        }
        else if(child.type==="em_close"){
            flushText();
            currentFormatting.italic=false;
        }
        else if(child.type==="strong_open"){
            flushText();
            currentFormatting.bold=true;
        }
        else if(child.type==="strong_close"){
            flushText();
            currentFormatting.bold=false;
        }
    })

    flushText();

    return textRuns;
};

// Helper: Convert Markdown to DOCX paragraphs
const processMarkdownToDocx = (markdown) => {
  const tokens = md.parse(markdown, {});
  const paragraphs = [];
  let inList = false;
  let listType = null;
  let orderedCounter = 1;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    try {
      // ---------- HEADINGS ----------
      if (token.type === "heading_open") {
        const level = parseInt(token.tag.substring(1), 10);
        const nextToken = tokens[i + 1];

        if (nextToken && nextToken.type === "inline") {
          let headingLevel;
          let fontSize;

          switch (level) {
            case 1:
              headingLevel = HeadingLevel.HEADING_1;
              fontSize = DOCX_STYLES.sizes.h1;
              break;
            case 2:
              headingLevel = HeadingLevel.HEADING_2;
              fontSize = DOCX_STYLES.sizes.h2;
              break;
            case 3:
              headingLevel = HeadingLevel.HEADING_3;
              fontSize = DOCX_STYLES.sizes.h3;
              break;
            default:
              headingLevel = HeadingLevel.HEADING_1;
              fontSize = DOCX_STYLES.sizes.h1;
          }

          paragraphs.push(
            new Paragraph({
              text: nextToken.content,
              heading: headingLevel,
              spacing: {
                before: DOCX_STYLES.spacing.headingBefore,
                after: DOCX_STYLES.spacing.headingAfter,
              },
              style: {
                font: DOCX_STYLES.fonts.heading,
                size: fontSize * 2,
              },
            })
          );

          i += 2;
        }
      }

      // PARAGRAPH 
      else if (token.type === "paragraph_open") {
        const nextToken = tokens[i + 1];
        if (nextToken && nextToken.type === "inline" && nextToken.children) {
          const textRuns = processInlineContent(nextToken.children);
          if (textRuns.length > 0) {
            paragraphs.push(
              new Paragraph({
                children: textRuns,
                spacing: {
                  before: inList ? 100 : DOCX_STYLES.spacing.paragraphBefore,
                  after: inList ? 100 : DOCX_STYLES.spacing.paragraphAfter,
                  line: 360,
                },
                alignment: AlignmentType.JUSTIFIED,
              })
            );
          }
          i += 2;
        }
      }

      // BULLET LIST
      else if (token.type === "bullet_list_open") {
        inList = true;
        listType = "bullet";
      } else if (token.type === "bullet_list_close") {
        inList = false;
        listType = null;
        paragraphs.push(new Paragraph({ text: "", spacing: { after: 100 } }));
      }

      //ORDERED LIST
      else if (token.type === "ordered_list_open") {
        inList = true;
        listType = "ordered";
        orderedCounter = 1;
      } else if (token.type === "ordered_list_close") {
        inList = false;
        listType = null;
        orderedCounter = 1;
        paragraphs.push(new Paragraph({ text: "", spacing: { after: 100 } }));
      }

      //LIST ITEM 
      else if (token.type === "list_item_open") {
        const nextToken = tokens[i + 1];
        if (nextToken && nextToken.type === "paragraph_open") {
          const inlineToken = tokens[i + 2];
          if (
            inlineToken &&
            inlineToken.type === "inline" &&
            inlineToken.children
          ) {
            const textRuns = processInlineContent(inlineToken.children);
            let bulletText = "";
            if (listType === "bullet") {
              bulletText = "• ";
            } else if (listType === "ordered") {
              bulletText = `${orderedCounter}. `;
              orderedCounter++;
            }

            paragraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: bulletText,
                    font: DOCX_STYLES.fonts.body,
                  }),
                  ...textRuns,
                ],
                spacing: { before: 50, after: 50 },
                indent: { left: 720 },
              })
            );
            i += 4;
          }
        }
      }

      // BLOCKQUOTE 
      else if (token.type === "blockquote_open") {
        const nextToken = tokens[i + 1];
        if (nextToken && nextToken.type === "paragraph_open") {
          const inlineToken = tokens[i + 2];
          if (inlineToken && inlineToken.type === "inline") {
            paragraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: inlineToken.content,
                    italics: true,
                    color: "666666",
                    font: DOCX_STYLES.fonts.body,
                  }),
                ],
                spacing: { before: 200, after: 200 },
                indent: { left: 720 },
                alignment: AlignmentType.JUSTIFIED,
                border: {
                  left: {
                    color: "4F46E5",
                    space: 1,
                    style: "single",
                    size: 24,
                  },
                },
              })
            );
            i += 4;
          }
        }
      }

      // CODE BLOCK
      else if (token.type === "code_block" || token.type === "fence") {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: token.content,
                font: "Courier New",
                size: 20,
                color: "333333",
              }),
            ],
            spacing: { before: 200, after: 200 },
            shading: { fill: "F5F5F5" },
          })
        );
      }

      // HORIZONTAL RULE
      else if (token.type === "hr") {
        paragraphs.push(
          new Paragraph({
            text: "",
            spacing: { before: 200, after: 200 },
            border: {
              bottom: {
                color: "CCCCCC",
                space: 1,
                style: "single",
                size: 6,
              },
            },
          })
        );
      }
    } catch (tokenError) {
      console.log("Error processing token:", tokenError);
      continue;
    }
  }

  return paragraphs;
};



//  Controller: Export as DOCX
const exportAsDocument = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }

    if (book.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to update this book",
      });
    }  
    const sections = [];

    // COVER IMAGE
    if (book.coverImage && !book.coverImage.includes("pravatar")) {
      const imagePath = path.join(
        __dirname,
        "..",
        book.coverImage.startsWith("/")
          ? book.coverImage.substring(1)
          : book.coverImage,
      );
      if (fs.existsSync(imagePath)) {
        const imageBuffer = fs.readFileSync(imagePath);
        sections.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: imageBuffer,
                transformation: { width: 400, height: 550 },
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 400 },
          }),
          new Paragraph({ text: "", pageBreakBefore: true })
        );
      }
    }

    // TITLE PAGE
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: book.title,
            font: DOCX_STYLES.fonts.heading,
            size: DOCX_STYLES.sizes.title * 2,
            bold: true,
            color: "1A202C",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 2000, after: 400 },
      })
    );

    if (book.subTitle && book.subTitle.trim()) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: book.subTitle,
              font: DOCX_STYLES.fonts.heading,
              size: DOCX_STYLES.sizes.subtitle,
              bold: true,
              color: "1A202C",
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        })
      );
    }

    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `by ${book.author}`,
            font: DOCX_STYLES.fonts.heading,
            size: DOCX_STYLES.sizes.author,
            bold: true,
            color: "2D3748",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "",
        border: {
          bottom: { color: "4F46E5", space: 1, size: 12, style: "single" },
        },
        alignment: AlignmentType.CENTER,
        spacing: { before: 400 },
      })
    );

    //CHAPTERS
    book.chapter.forEach((chapter, index) => {
      sections.push(
        new Paragraph({ text: "", pageBreakBefore: true }),
        new Paragraph({
          children: [
            new TextRun({
              text: chapter.title,
              bold: true,
              font: DOCX_STYLES.fonts.heading,
              size: DOCX_STYLES.sizes.ChapterTitle,
              color: "1A202C",
            }),
          ],
          spacing: {
            before: DOCX_STYLES.spacing.chapterBefore,
            after: DOCX_STYLES.spacing.chapterAfter,
          },
        }),
        ...processMarkdownToDocx(chapter.content || "")
      );
    });

    // CREATE DOCX 
    const docx = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
            },
          },
          children: sections,
        },
      ],
    });

    const buffer = await Packer.toBuffer(docx);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${book.title.replace(/[^a-zA-Z0-9]/g, "_")}.docx"`
    );
    res.setHeader("Content-Length", buffer.length);
    res.send(buffer);
  } catch (e) {
    console.error("Error exporting Document:", e);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Internal Server Error during the document export",
        error: e.message,
      });
    }
  }
};


const TYPOGRAPHY={
  fonts: {
    sans: "Helvetica",
    sansBold: "Helvetica-Bold",
    serif: "Times-Roman",
    serifBold: "Times-Bold",
    serifItalic: "Times-Italic",
    sansOblique: "Helvetica-Oblique",
  },
  sizes: {
    title: 28,
    author: 16,
    ChapterTitle: 20,
    h1: 18,
    h2: 16,
    h3: 14,
    body:11,
    caption:9
  },
  colors: {
    text:"#333333",
    heading: "#1A1A1A",
    accent: "#4F46ES",
  },
  spacing: {
    paragraphSpacing:12,
    chapterSpacing:24,
    headingSpacing:{before:16, after:8},
    listSpacing:6
  },
}

 const renderInlineTokens=(doc, tokens, options ={})=>{
    if(!Array.isArray(tokens) || tokens.length===0){
        return;
    }

    const baseOptions={
      align: options.align || "justify",
      indent: options.indent ||0,
      lineGap: options.lineGap || 2
    };

    let currentfont= TYPOGRAPHY.fonts.serif;
    let textBuffer="";


    const flushBuffer=()=>{
       if(textBuffer){
        doc.font(currentfont).text(textBuffer, {
          ...baseOptions,
          continued:true,
        })
        textBuffer="";
       }
    };


    for(let i=0;i<tokens.length;i++){
      const token=tokens[i];
      if(token.type==="text"){
        textBuffer+=token.content;
      }else if(token.type==="strong_open"){
        flushBuffer();
        currentfont=TYPOGRAPHY.fonts.serifBold;
      }else if(token.type === "strong_close"){
        flushBuffer();
        currentfont=TYPOGRAPHY.fonts.serif;
      }else if(token.type === "em_open"){
        flushBuffer();
        currentfont=TYPOGRAPHY.fonts.serifItalic;
      }else if(token.type === "em_close"){
        flushBuffer();
        currentfont=TYPOGRAPHY.fonts.serif;
      }else if(token.type === "code_inline"){
        flushBuffer();
        doc.font("Courier").text(token.content, {
          ...baseOptions,
          continued:true,
        });
        doc.font(currentfont);
      }     
    }

    if(textBuffer){
      doc.font(currentfont).text(textBuffer,{
        ...baseOptions,
        continued: false,
      });
    }else{
      doc.text("",{continued:true});
    }

 }


 const renderMarkdown=(doc,markdown)=>{
  if(!markdown || markdown.trim()===""){
    return;
  }
  const tokens=md.parse(markdown,{});
  let inList=false;
  let listType=null;
  let orderedCounter=1;

  for(let i=0;i<tokens.length;i++){
    const token=tokens[i];

    try {
      if(token.type === "heading_open"){
        const level=parseInt(token.tag.substring(1),10);
        let fontSize;

        switch(level){
          case 1:
            fontSize=TYPOGRAPHY.sizes.h1;
            break;
          case 2:
            fontSize=TYPOGRAPHY.sizes.h2;
            break;
          case 3:
            fontSize=TYPOGRAPHY.sizes.h3;
            break;
          default:
            fontSize=TYPOGRAPHY.sizes.h3;
            break;
        }

        doc.moveDown(
          TYPOGRAPHY.spacing.headingSpacing.before / TYPOGRAPHY.sizes.body
        )

        doc
          .font(TYPOGRAPHY.fonts.sansBold)
          .fontSize(fontSize)
          .fillColor(TYPOGRAPHY.colors.heading)
          
        if(i+1 < tokens.length && tokens[i+1].type=== "inline"){
          renderInlineTokens(doc, tokens[i+1].children, {
            align:"left",
            lineGap:0,
          });
          i++;
        }

        doc.moveDown(
          TYPOGRAPHY.spacing.headingSpacing.after / TYPOGRAPHY.sizes.body
        )
      }else if(token.type === "paragraph_open"){
        doc.font(TYPOGRAPHY.fonts.serif).fontSize(TYPOGRAPHY.sizes.body).fillColor(TYPOGRAPHY.colors.text);

        if(i+1< tokens.length && tokens[i+1].type==="inline"){
          renderInlineTokens(doc, tokens[i+1].children, {
            align:"justify",
            lineGap:2
          });
          i++;
        }

        if(!inList){
          doc.moveDown(TYPOGRAPHY.spacing.paragraphSpacing / TYPOGRAPHY.sizes.body);
        }else{
          doc.moveDown(TYPOGRAPHY.spacing.listSpacing / TYPOGRAPHY.sizes.body);
        }

        if(i+1< tokens.length && tokens[i+1].type==="paragraph_close"){
         i++;
        }
      }else if(token.type === "bullet_list_open"){
        inList=true;
        listType="bullet";
        doc.moveDown(TYPOGRAPHY.spacing.listSpacing / TYPOGRAPHY.sizes.body);
      }else if(token.type==="bullet_list_close"){
        inList=false;
        listType=null;
        doc.moveDown(TYPOGRAPHY.spacing.listSpacing / TYPOGRAPHY.sizes.body);
      }else if(token.type === "ordered_list_open"){
        inList=true;
        listType="ordered";
        orderedCounter=1;
        doc.moveDown(TYPOGRAPHY.spacing.listSpacing / TYPOGRAPHY.sizes.body);
      }else if(token.type==="ordered_list_close"){
        inList=false;
        listType=null;
        orderedCounter=1;
        doc.moveDown(TYPOGRAPHY.spacing.listSpacing / TYPOGRAPHY.sizes.body);
      }else if(token.type === "list_item_open"){
        let bullet="";
        if(listType==="bullet"){
          bullet = "• ";
        }else if(listType==="ordered"){
         bullet = `${orderedCounter}. `;
         orderedCounter++;
        }

        doc
          .font(TYPOGRAPHY.fonts.serif)
          .fontSize(TYPOGRAPHY.sizes.body)
          .fillColor(TYPOGRAPHY.colors.text)

        doc.text(bullet, {indent:20,continued:true});

        for(let j=i+1;j<tokens.length;j++){
          if(tokens[j].type === "inline" && tokens[j].children){
            renderInlineTokens(doc, tokens[j].children,{
              align:"left",
              lineGap: 2
            });
            break;
          }else if(tokens[j].type === "list_item_close"){
            break;
          }
        }
        doc.moveDown(TYPOGRAPHY.spacing.listSpacing / TYPOGRAPHY.sizes.body);
      }else if(token.type === "code_block" || token.type==="fence"){
       doc.moveDown(TYPOGRAPHY.spacing.paragraphSpacing / TYPOGRAPHY.sizes.body);
       doc
        .font("Courier")
        .fontSize(9)
        .fillColor(TYPOGRAPHY.colors.text)
        .text(token.content, {indent:20, align:"left"});
        doc.font(TYPOGRAPHY.fonts.serif).fontSize(TYPOGRAPHY.sizes.body);
        doc.moveDown(TYPOGRAPHY.spacing.chapterSpacing / TYPOGRAPHY.sizes.body);

      }else if(token.type === "hr"){
        doc.moveDown();
        const y=doc.y;
        doc
          .moveTo(doc.page.margin.left,y)
          .lineTo(doc.page.width - doc.page.margin.right, y)
          .stroke();

          doc.moveDown();
      }


    } catch (error) {
      console.error("Error rendering token:", token.type, error);
      continue;
    }
  }
 }
const exportAsPDF = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }

   if (book.userId.toString() !== req.user._id.toString()) {
     return res.status(401).json({
       success: false,
       message: "Not authorized to update this book",
     });
   }  

    const doc = new PDFDocument({
      margins: {
        top: 72,
        bottom: 72,
        left: 72,
        right: 72,
      },
      bufferPages: true,
      autoFirstPage: true,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${book.title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf"`
    );

    doc.pipe(res);

    // --- Cover image ---
    if (book.coverImage && !book.coverImage.includes("pravatar")) {
      const imagePath = path.join(
        __dirname,
        "..",
        book.coverImage.startsWith("/")
          ? book.coverImage.substring(1)
          : book.coverImage,
      );
      try {
        if (fs.existsSync(imagePath)) {
          const pageWidth =
            doc.page.width - doc.page.margins.left - doc.page.margins.right;
          doc.image(imagePath, doc.page.margins.left, doc.page.margins.top, {
            fit: [pageWidth * 0.8, pageWidth * 0.8],
            align: "center",
            valign: "center",
          });
          doc.addPage();
        }
      } catch (imgerror) {
        console.error("Error processing image:", imgerror);
      }
    }

    // --- Title ---
    doc
      .font(TYPOGRAPHY.fonts.sansBold)
      .fontSize(TYPOGRAPHY.sizes.title)
      .fillColor(TYPOGRAPHY.colors.heading)
      .text(book.title, { align: "center" })
      .moveDown(2);

    // --- Subtitle ---
    if (book.subTitle && book.subTitle.trim()) {
      doc
        .font(TYPOGRAPHY.fonts.sans)
        .fontSize(TYPOGRAPHY.sizes.h2)
        .fillColor(TYPOGRAPHY.colors.text)
        .text(book.subTitle, { align: "center" })
        .moveDown(1);
    }

    // --- Author ---
    doc
      .font(TYPOGRAPHY.fonts.sans)
      .fontSize(TYPOGRAPHY.sizes.author)
      .fillColor(TYPOGRAPHY.colors.text)
      .text(book.author, { align: "center" })
      .moveDown(1);

    // --- Chapters ---
    if (book.chapter && book.chapter.length > 0) {
      book.chapter.forEach((chapter, index) => {
        doc.addPage();
        doc
          .font(TYPOGRAPHY.fonts.sansBold)
          .fontSize(TYPOGRAPHY.sizes.ChapterTitle)
          .fillColor(TYPOGRAPHY.colors.heading)
          .text(`Chapter ${index + 1}: ${chapter.title}`, { align: "left" });

        doc.moveDown(TYPOGRAPHY.spacing.chapterSpacing / TYPOGRAPHY.sizes.body);

        if (chapter.content && chapter.content.trim() !== "") {
          renderMarkdown(doc, chapter.content);
        }
      });
    }

    // --- End the PDF ---
    doc.end();
  } catch (error) {
    console.error("Error exporting PDF:", error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Internal Server Error during the PDF export",
        error: error.message,
      });
    }
  }
};
module.exports = { exportAsDocument,exportAsPDF };
