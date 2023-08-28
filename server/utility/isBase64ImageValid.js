const { Buffer } = require("buffer");
const sizeOf = require("image-size");

function extractBase64Data(base64String) {
  if (base64String.startsWith("data:")) {
    const commaIndex = base64String.indexOf(",");

    return base64String.slice(commaIndex + 1);
  }

  return base64String;
}

function isValidImage(imageBuffer) {
  try {
    const dimensions = sizeOf(imageBuffer);
    console.log(dimensions)

    if (
      ["jpg", "png", "jpeg", "webp"].includes(dimensions.type)
    ) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
}

function isBase64ImageValid(base64String) {
  try {
    // Decoding the base64 string to a buffer
    const buffer = Buffer.from(extractBase64Data(base64String), "base64");

    // Checking if the buffer is not empty
    if (buffer.length === 0 || !isValidImage(buffer)) {
      return false;
    }

    return true;
  } catch (error) {
    // If an error occurs during decoding, it means the base64 string is invalid.
    return false;
  }
}

module.exports = { isBase64ImageValid };
