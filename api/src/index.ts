import "reflect-metadata";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { AppDataSource } from "./data-source";
import invoiceRoutes from "./routes/invoices";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import { authMiddleware } from "./middleware/auth.middleware";

dotenv.config();

const app = express();
app.use(express.json());

// CORS configuration
const rawOrigins = process.env.CORS_ALLOWED_ORIGINS || "";
const allowedOrigins = rawOrigins.split(",").map((s) => s.trim()).filter(Boolean);

const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        // If origin is undefined (curl, server-to-server requests), allow it
        if (!origin) return callback(null, true);

        // If no explicit origins provided, allow all (dev convenience)
        if (allowedOrigins.length === 0) return callback(null, true);

        // Allow if exact match
        if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);

        // Otherwise block
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true, // allow cookies/auth headers if needed
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"],
};

// Enable CORS for all routes with options handling for preflight
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // preflight

AppDataSource.initialize()
    .then(() => {
        console.log("Data Source initialized");

        app.use("/auth", authRoutes);

        app.use("/invoices", authMiddleware, invoiceRoutes);

        app.use("/users", authMiddleware, userRoutes);

        app.get("/health", (_req, res) => res.json({ ok: true }));

        const port = process.env.PORT || 4000;
        app.listen(port, () => console.log(`Server listening on ${port}`));
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err);
    });

// Optional: a friendly error handler to return 403 for blocked CORS requests
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (err && /CORS/i.test(err.message)) {
        return res.status(403).json({ message: "CORS error: origin not allowed" });
    }
    // fallthrough to default error handling
    console.error("Unhandled error:", err);
    return res.status(500).json({ message: "Internal server error" });
});