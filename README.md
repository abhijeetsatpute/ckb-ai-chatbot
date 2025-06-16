CKB-AI-CHATBOT
==============

_Empowering Conversations, Unlocking Knowledge Instantly_

![last-commit](https://img.shields.io/github/last-commit/abhijeetsatpute/ckb-ai-chatbot?style=flat&logo=git&logoColor=white&color=0080ff) ![repo-top-language](https://img.shields.io/github/languages/top/abhijeetsatpute/ckb-ai-chatbot?style=flat&color=0080ff) ![repo-language-count](https://img.shields.io/github/languages/count/abhijeetsatpute/ckb-ai-chatbot?style=flat&color=0080ff)

_Built with the tools and technologies:_

![Express](https://img.shields.io/badge/Express-000000.svg?style=flat&logo=Express&logoColor=white) ![JSON](https://img.shields.io/badge/JSON-000000.svg?style=flat&logo=JSON&logoColor=white) ![Markdown](https://img.shields.io/badge/Markdown-000000.svg?style=flat&logo=Markdown&logoColor=white) ![npm](https://img.shields.io/badge/npm-CB3837.svg?style=flat&logo=npm&logoColor=white) ![Cheerio](https://img.shields.io/badge/Cheerio-E88C1F.svg?style=flat&logo=Cheerio&logoColor=white) ![.ENV](https://img.shields.io/badge/.ENV-ECD53F.svg?style=flat&logo=dotenv&logoColor=black) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E.svg?style=flat&logo=JavaScript&logoColor=black)  
![LangChain](https://img.shields.io/badge/LangChain-1C3C3C.svg?style=flat&logo=LangChain&logoColor=white) ![React](https://img.shields.io/badge/React-61DAFB.svg?style=flat&logo=React&logoColor=black) ![Docker](https://img.shields.io/badge/Docker-2496ED.svg?style=flat&logo=Docker&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6.svg?style=flat&logo=TypeScript&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-646CFF.svg?style=flat&logo=Vite&logoColor=white) ![ESLint](https://img.shields.io/badge/ESLint-4B32C3.svg?style=flat&logo=ESLint&logoColor=white) ![Axios](https://img.shields.io/badge/Axios-5A29E4.svg?style=flat&logo=Axios&logoColor=white)


***

## High-Level Design (HLD)

Below is the **High-Level Design (HLD)** of the system, illustrating the architecture and deployment model of the system in Production.

![Low-Level Design](docs/system_design.jpg)

  

* * *

Table of Contents
-----------------

*   [Overview](#overview)
*   [Getting Started](#getting-started)
    *   [Prerequisites](#prerequisites)
    *   [Installation](#installation)
    *   [Usage](#usage)
    *   [Testing](#testing)

* * *

🤖 Overview
--------

ckb-ai-chatbot is a custom knowledge base AI solution that allows businesses to create intelligent chatbots trained on their specific content and documentation. The system enables seamless integration of AI-powered customer support directly into any website.

**Why ckb-ai-chatbot?**

This project empowers developers to create conversational AI systems that seamlessly ingest and retrieve knowledge from diverse sources. The core features include:

*   🛠️ **Deployment Automation:** Streamlined CI/CD workflows for efficient release cycles.
*   🚀 **Containerized Environment:** Self-contained Docker setup for consistent builds and runtime.
*   🔍 **Semantic Content Search:** Intelligent ingestion and retrieval from files, web links, and WordPress content.
*   💬 **Real-Time Chat Interface:** Interactive UI for engaging AI conversations.
*   🧑‍💻 **Admin Tools:** Easy management of data sources and knowledge base maintenance.
*   🔧 **Flexible Configuration:** Environment variables and version tracking for reliable deployment.

* * *

Getting Started
---------------

### Prerequisites

This project requires the following dependencies:

*   **Programming Language:** JavaScript
*   **Package Manager:** Npm
*   **Container Runtime:** Docker

### Installation

Build ckb-ai-chatbot from the source and install dependencies:

1.  **Clone the repository:**
    
        ❯ git clone https://github.com/abhijeetsatpute/ckb-ai-chatbot
        
    
2.  **Navigate to the project directory:**
    
        ❯ cd ckb-ai-chatbot
        
    
3.  **Install the dependencies:**
    

**Using [docker](https://www.docker.com/):**

    ❯ docker build -t abhijeetsatpute/ckb-ai-chatbot .
    

**Using [npm](https://www.npmjs.com/):**

    ❯ npm install
    

### Usage

Run the project with:

**Using [docker](https://www.docker.com/):**

    docker run -it {image_name}
    

**Using [npm](https://www.npmjs.com/):**

    npm start
    
* * *

[⬆ Return](#top)

* * *