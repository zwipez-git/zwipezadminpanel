import admin from "firebase-admin";
import fs from "fs";

let serviceAccount;

// ✅ RENDER / PRODUCTION
if (process.env.FIREBASE_SERVICE_ACCOUNT) {

  serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT
  );

} else {

  // ✅ LOCAL
  serviceAccount = JSON.parse(
    fs.readFileSync(
      "./serviceAccountKey.json",
      "utf8"
    )
  );
}

admin.initializeApp({
  credential: admin.credential.cert(
    serviceAccount
  ),
});

export default admin;