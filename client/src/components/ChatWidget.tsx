"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  IconButton,
  InputBase,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import CloseIcon from "@mui/icons-material/Close";
import ReactMarkdown from "react-markdown";

interface Message {
  content: string;
  role: "user" | "assistant";
}

const welcomeMessages = [
  "👋 Hi there! I'm askBot — feel free to ask me anything!",
  "Namaste 🙏 I'm askBot — here to help with your questions!",
  "👋 Hey! Got a question? I'm all ears — ask away!",
  "👋 Welcome! I'm askBot — ready when you are!",
  "👋 Hello! askBot here — let’s chat. Ask me anything!",
];

const getRandomWelcome = () =>
  welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];

const ChatWidget: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [hasWelcomed, setHasWelcomed] = useState(false);

  const chatRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !hasWelcomed) {
      setMessages([{ content: getRandomWelcome(), role: "assistant" }]);
      setHasWelcomed(true);
    }
  }, [isOpen, hasWelcomed]);

  useEffect(() => {
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isSending]);

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      setMessages([{ content: getRandomWelcome(), role: "assistant" }]);
    } else {
      setMessages([]);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { content: trimmed, role: "user" }]);
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const { answer } = await response.json();
      setMessages((prev) => [...prev, { content: answer, role: "assistant" }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          content: "Error fetching response. Please try again.",
          role: "assistant",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <motion.div
        style={{
          position: "fixed",
          bottom: isMobile ? 10 : 48,
          right: isMobile ? 10 : 48,
          zIndex: 1300,
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          variant="contained"
          onClick={toggleChat}
          sx={{
            borderRadius: 3,
            px: 1,
            py: 1,
            backgroundColor: "rgba(195, 192, 180, 0.85)",
            color: "#212121",
            "&:hover": {
              backgroundColor: "rgba(180, 177, 165, 0.95)",
            },
          }}
        >
          <SmartToyIcon fontSize="large" sx={{ color: "#c05041" }} />
          <Typography
            ml={1}
            fontSize={22}
            fontFamily="sans-serif"
            textTransform={"none"}
          >
            ask
            <Box component="span" sx={{ color: "#c05041", fontWeight: 800 }}>
              Bot
            </Box>
          </Typography>
        </Button>
      </motion.div>

      {isOpen && (
        <motion.div
          ref={chatRef}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          style={{
            position: "fixed",
            bottom: 0,
            right: isMobile ? 0 : 16,
            width: isMobile ? "100%" : 500,
            height: "80vh",
            zIndex: 1300,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Paper
            elevation={8}
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              borderTopLeftRadius: 25,
              borderTopRightRadius: 25,
            }}
          >
            {/* Header */}
            <Box
              sx={{
                p: 2,
                bgcolor: "rgba(195, 192, 180, 0.85)",
                color: "#212121",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTopLeftRadius: 25,
                borderTopRightRadius: 25,
              }}
            >
              <SmartToyIcon fontSize="large" sx={{ color: "#c05041" }} />
              <Typography ml={1} fontSize={22} fontFamily="sans-serif">
                ask
                <Box
                  component="span"
                  sx={{ color: "#c05041", fontWeight: 800 }}
                >
                  Bot
                </Box>
              </Typography>
              <IconButton onClick={toggleChat} sx={{ color: "#212121" }}>
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Messages */}
            <Box
              ref={messagesRef}
              sx={{
                flexGrow: 1,
                overflowY: "auto",
                px: 2,
                py: 1,
                bgcolor: "background.default",
              }}
            >
              {messages.map((msg, i) => (
                <Box
                  key={i}
                  display="flex"
                  justifyContent={
                    msg.role === "user" ? "flex-end" : "flex-start"
                  }
                  mb={2}
                >
                  <Box
                    px={2}
                    py={1}
                    borderRadius={2}
                    maxWidth="90%"
                    bgcolor={
                      msg.role === "user"
                        ? "rgba(195, 192, 180, 0.85)"
                        : "grey.800"
                    }
                    color={msg.role === "user" ? "#212121" : "grey.100"}
                    sx={{ wordWrap: "break-word" }}
                  >
                    {msg.role === "assistant" ? (
                      <ReactMarkdown
                        components={{
                          a: ({ href, children }) => (
                            <a
                              href={href!}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: "#64b5f6",
                                textDecoration: "underline",
                              }}
                            >
                              {children}
                            </a>
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </Box>
                </Box>
              ))}

              {isSending && (
                <Box display="flex" justifyContent="flex-start" mb={2}>
                  <Box
                    px={2}
                    py={1}
                    borderRadius={2}
                    maxWidth="90%"
                    bgcolor="grey.800"
                    color="grey.100"
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <CircularProgress size={18} color="inherit" />
                    <Typography fontSize={14}>Thinking...</Typography>
                  </Box>
                </Box>
              )}
            </Box>

            {/* Input */}
            <Box
              component="form"
              onSubmit={handleSend}
              sx={{
                display: "flex",
                gap: 1,
                p: 2,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <InputBase
                fullWidth
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && input.trim()) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                sx={{
                  bgcolor: "grey.100",
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  flex: 1,
                }}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={!input.trim() || isSending}
                sx={{
                  bgcolor: "rgba(195, 192, 180, 0.85)",
                  color: "#212121",
                  "&:hover": {
                    bgcolor: "rgba(180, 177, 165, 0.95)",
                  },
                }}
              >
                {isSending ? "..." : "Send"}
              </Button>
            </Box>
          </Paper>
        </motion.div>
      )}
    </>
  );
};

export default ChatWidget;
