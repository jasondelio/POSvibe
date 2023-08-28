const sharp = require("sharp");

async function compressImage(base64Image) {
  // Compression options
  const quality = 20; // Adjust the quality level (0 to 100) as needed

  // Convert the base64 image to a Buffer
  const imageBuffer = Buffer.from(base64Image.split(",")[1], "base64");

  try {
    // Compress the image and convert back to base64
    const compressedImageBuffer = await sharp(imageBuffer)
      .webp({ quality: quality })
      .toBuffer();

    const compressedBase64Image = `data:image/webp;base64,${compressedImageBuffer.toString(
      "base64"
    )}`;
    console.log("Image compressed successfully.");
    return compressedBase64Image;
  } catch (err) {
    console.error("Error compressing the image:", err);
    throw new Error("Failed to compress image");
  }
}

module.exports = { compressImage };
