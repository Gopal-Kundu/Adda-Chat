import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Linkedin, Github } from "lucide-react";
import "../index.css";
import { useSelector } from "react-redux";
import ChatPage from "./ChatPage";

function WelcomePage() {
    const user = useSelector((state) => state.auth.user);

    if (user) {
        return <ChatPage />;
    } else {
        return (
            <div className="relative min-h-screen bg-black text-white overflow-hidden flex flex-col justify-center items-center selection:bg-purple-500/30">

                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] pointer-events-none" />

                <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"></div>

                <div className="relative z-10 flex flex-col items-center w-full max-w-5xl px-6 py-12 mx-auto text-center">

                    <h1 className="text-6xl md:text-9xl font-extrabold tracking-tighter mb-6">
                        Welcome to{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-500 animate-gradient-x">
                            Adda Chat
                        </span>
                    </h1>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                        <Link
                            to="/login"
                            className="group relative flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-white text-black rounded-2xl font-bold text-lg hover:bg-gray-200 transition-all duration-300 active:scale-95"
                        >
                            Get Started
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <Link
                            to="/login"
                            className="flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-transparent border border-white/20 text-white rounded-2xl font-bold text-lg hover:bg-white/5 transition-all duration-300 active:scale-95"
                        >
                            Login to Account
                        </Link>
                    </div>

                    {/* Footer Section */}
                    <div className="mt-12 flex flex-col items-center gap-3 text-sm text-gray-400">
                        <p>Made by <span className="text-white font-semibold">Gopal Kundu</span></p>

                        <div className="flex gap-4">
                            <a
                                href="https://www.linkedin.com/in/gopalcodes"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-white transition"
                            >
                                <Linkedin className="w-6 h-6" />
                            </a>

                            <a
                                href="https://github.com/Gopal-Kundu/Adda-Chat"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-white transition"
                            >
                                <Github className="w-6 h-6" />
                            </a>
                        </div>
                    </div>

                </div>
            </div>
        );
    }
}

export default WelcomePage;