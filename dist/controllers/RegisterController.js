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
exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = __importDefault(require("../db/db"));
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, role } = req.body;
        // 1. Validatie: Check of velden aanwezig zijn
        if (!email || !password) {
            res.status(400).json({ message: "E-mail en wachtwoord zijn verplicht." });
            return;
        }
        // 2. Database logic: Check of de gebruiker al bestaat
        // We gebruiken $1 als placeholder om SQL-injectie te voorkomen
        const checkQuery = 'SELECT * FROM users WHERE email = $1';
        const userExists = yield db_1.default.query(checkQuery, [email]);
        if (userExists.rows.length > 0) {
            res.status(400).json({ message: "Gebruiker bestaat al binnen Area52!" });
            return;
        }
        // 3. Security: Wachtwoord hashen
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
        // 4. Database logic: Nieuwe gebruiker invoegen
        const insertQuery = 'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)';
        const userRole = role || 'guest'; // Standaardwaarde
        yield db_1.default.query(insertQuery, [email, hashedPassword, userRole]);
        // 5. Succesrespons
        res.status(201).json({ message: "Account succesvol aangemaakt!" });
    }
    catch (error) {
        // Log de fout naar de server-console voor debugging
        console.error("Fout tijdens registratie:", error);
        // Stuur een algemene foutmelding naar de frontend
        res.status(500).json({ message: "Er is een fout opgetreden tijdens de registratie." });
    }
});
exports.register = register;
