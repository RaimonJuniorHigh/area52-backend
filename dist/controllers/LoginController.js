"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../db/db"));
const JWT_SECRET = process.env.JWT_SECRET;
if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is niet gedefinieerd in de server-omgeving.");
}
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // 1. Validatie: Check input
        if (!email || !password) {
            res.status(400).json({ message: "E-mail en wachtwoord zijn verplicht." });
            return;
        }
        // 2. Database logic: Zoek de gebruiker op
        const result = yield db_1.default.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        if (!user) {
            res.status(401).json({ message: "Ongeldige inloggegevens." });
            return;
        }
        // 3. Verificatie: Vergelijk het wachtwoord
        const validPassword = yield bcryptjs_1.default.compare(password, user.password_hash);
        if (!validPassword) {
            res.status(401).json({ message: "Ongeldige inloggegevens." });
            return;
        }
        // 4. Autorisatie: Genereer de JWT Token
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' });
        // 5. Succesrespons
        res.status(200).json({
            message: "Authenticatie succesvol",
            token: token
        });
    }
    catch (error) {
        console.error("Fout tijdens inloggen:", error);
        res.status(500).json({ message: "Interne serverfout tijdens het inloggen." });
    }
});
exports.login = login;
