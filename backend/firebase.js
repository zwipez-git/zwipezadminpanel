import admin from "firebase-admin";
import fs from "fs";

// 🔥 READ JSON FILE
const serviceAccount = JSON.parse(
  fs.readFileSync("./serviceAccountKey.json", "utf8")
);

// 🔥 INIT FIREBASE
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;