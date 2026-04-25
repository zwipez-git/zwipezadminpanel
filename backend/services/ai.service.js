import pool from "../db/db.js";

/// 🎯 RANDOM PICK
const getRandom = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
};

/// 👋 GREETINGS
const greetings = [
  "Hey bro 😎 what do you want today?",
  "Welcome boss 🛒 ready to shop?",
  "Hello 👋 tell me what you need",
];

/// 😎 FUN REPLIES
const funReplies = [
  "I'm your personal shopkeeper 😎 ask anything!",
  "Don't worry bro, I’ll find best items for you 🛒",
];

/// 😂 JOKES
const jokes = [
  "Why did the tomato blush? 🍅 Because it saw the salad dressing 😂",
  "Why don’t eggs tell jokes? 🥚 They might crack up 🤣",
];

/// 💬 SMALL TALK
const smallTalk = {
  "how are you": "I'm super good 😎 ready to help you shop!",
  "who are you": "I'm your AI shopkeeper 🤖",
  "thank you": "Anytime bro 🙌",
  "bye": "Bye bro 👋 come back soon!",
};

/// 🌍 TANGLISH → ENGLISH MAP
const tanglishMap = {
  "paal": "milk",
  "milk": "milk",

  "muttai": "egg",
  "egg": "egg",

  "arisi": "rice",
  "rice": "rice",

  "thayir": "curd",
  "curd": "curd",

  "ennai": "oil",
  "oil": "oil",
};

/// 🔄 NORMALIZE MESSAGE
const normalizeMessage = (msg) => {
  let text = msg.toLowerCase().trim();

  Object.keys(tanglishMap).forEach((key) => {
    if (text.includes(key)) {
      text = text.replace(key, tanglishMap[key]);
    }
  });

  return text;
};

/// 🛒 DETECT INTENT
const detectIntent = (msg) => {
  if (
    msg.includes("buy") ||
    msg.includes("add") ||
    msg.includes("order")
  ) {
    return "ADD";
  }
  return "SEARCH";
};

/// 🧠 SEARCH PRODUCT FROM DB
const searchProduct = async (message) => {
  const result = await pool.query(
    `SELECT * FROM products WHERE LOWER(name) LIKE $1 LIMIT 5`,
    [`%${message.toLowerCase()}%`]
  );

  return result.rows;
};

/// 🧃 CATEGORY PRAISE
const getCategoryPraise = (name) => {
  const n = name.toLowerCase();

  if (n.includes("milk")) {
    return getRandom([
      "Rich in calcium 🥛",
      "Good for strong bones 💪",
    ]);
  }

  if (n.includes("egg")) {
    return getRandom([
      "High protein 🥚",
      "Energy booster food ⚡",
    ]);
  }

  return "Fresh & quality product 👍";
};

/// 🚀 MAIN AI FUNCTION
export const handleAIQuery = async (message) => {
  const msg = normalizeMessage(message);

  /// ✅ SMALL TALK
  if (smallTalk[msg]) {
    return { type: "TEXT", message: smallTalk[msg] };
  }

  /// ✅ GREETINGS
  if (msg.includes("hello") || msg.includes("hi")) {
    return { type: "TEXT", message: getRandom(greetings) };
  }

  /// ✅ JOKES
  if (msg.includes("joke")) {
    return { type: "TEXT", message: getRandom(jokes) };
  }

  /// 🧠 DB SEARCH
  const products = await searchProduct(msg);

  /// 🛒 ADD TO CART
  const intent = detectIntent(msg);
  if (intent === "ADD" && products.length > 0) {
    return {
      type: "ADD_TO_CART",
      product: products[0],
      message: `Added ${products[0].name} to cart 🛒`,
    };
  }
const extractQuantity = (msg) => {
  const match = msg.match(/\d+/); // find number

  if (match) {
    return parseInt(match[0]);
  }

  return 1; // default
};
  /// 🧾 PRODUCT LIST
  if (products.length > 0) {
    return {
      type: "PRODUCT_LIST",
      products,
      message: "Here are some products 👇",
    };
  }

  /// 🧃 PRODUCT PRAISE
  if (msg.includes("milk") || msg.includes("egg")) {
    return {
      type: "TEXT",
      message: getCategoryPraise(msg),
    };
  }

  /// 🤖 DEFAULT
  return {
    type: "TEXT",
    message: getRandom(funReplies),
  };
};