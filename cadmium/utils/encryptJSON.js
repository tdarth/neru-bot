import crypto from "crypto";

const { AES_SECRET_KEY } = process.env;

function encryptJSON(json) {
  const text = JSON.stringify(json);

  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv("aes-256-gcm", Buffer.from(AES_SECRET_KEY, "hex"), iv);

  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");

  const authTag = cipher.getAuthTag();

  return {
    iv: iv.toString("base64"),
    ciphertext: encrypted,
    tag: authTag.toString("base64"),
  };
}

module.exports = { encryptJSON };