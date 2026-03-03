const mammoth = require("mammoth");
const fs = require("fs");

mammoth
  .extractRawText({ path: "./sachquocgia_url_mapping.docx" })
  .then((result) => {
    fs.writeFileSync("./docx_content.txt", result.value, "utf8");
    console.log("Done! Content saved to docx_content.txt");
    console.log("Total chars:", result.value.length);
  })
  .catch((err) => console.error(err));
