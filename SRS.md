# Software Requirements Specification (SRS)
## Pharmacy Wholesale & Importer Website with RFQ Generator

### 1. Introduction
#### 1.1 Purpose
This document defines the requirements for a modern website for a pharmacy wholesale and importer company. The website will primarily provide company information, showcase products and services, and include an RFQ (Request for Quotation) Generator that allows pharmacies, hospitals, clinics, and distributors to request quotations for pharmaceutical products.

#### 1.2 Scope
The website will include:
- Home Page
- About Us
- Products / Categories (with Comparison feature)
- Services
- Contact Page
- RFQ Generator
- **Customer Portal** (Registration, Login, RFQ History)
- **Live Chat Support**
- **Multi-language Support**
- Admin Panel to manage RFQs, products, and website content

The website is informational and lead-generation focused rather than a full e-commerce platform.

---

### 2. User Types
| User Type | Description |
|-----------|-------------|
| **Visitor** | Any website visitor browsing the site. |
| **Customer** | Registered pharmacy, hospital, clinic, or distributor. Can submit RFQs and view history. |
| **Admin** | Internal staff managing RFQs, website content, products, and live chat. |

---

### 3. Website Pages and Features

#### 3.1 Global Features
- **Multi-language Support**: Toggle between languages (e.g., English, Arabic, French) across the entire site.
- **Live Chat**: Real-time communication between visitors/customers and support staff.

#### 3.2 Home Page
The Home Page shall contain the following sections:
- **Hero Section**: Large banner, company slogan, short description, and CTA buttons (“Request Quotation”, “View Products”).
- **About Company Section**: Brief overview, years of experience, mission, and vision.
- **Product Categories Section**: Display major categories (Prescription, OTC, Medical Supplies, etc.) with images and "Request Quote" buttons.
- **Why Choose Us Section**: Competitive pricing, genuine products, fast delivery, etc.
- **Featured Products Section**: Selected products with “Add to RFQ” buttons.
- **Process Section**: 4-step visualization (Browse -> Add -> Submit -> Receive).
- **Testimonials Section**: Customer feedback.
- **Contact Section**: Address, phone, email, map, and quick contact form.

#### 3.3 Products Page
- **Grid Layout**: Display all products.
- **Search & Filter**: Search by name, generic name, category, or brand. Filter by category.
- **Product Comparison**:
  - Users can select up to 4 products to compare side-by-side.
  - Comparison table includes: Product name, Generic name, Brand, Dosage form, Package size, and Country of origin.
- **Product Card**: Image, name, brand, package size, "Add to RFQ" button, and "Compare" checkbox.

#### 3.4 RFQ Generator
- **Step 1: Customer Information**: (Auto-filled if logged in) Name, Company, Business Type, Contact details.
- **Step 2: Product Selection**: 
  - Search/select products, set quantities, add per-product notes.
  - RFQ table: Name, Brand, Quantity, Unit, Note, Remove.
- **Step 3: Additional Information**: Delivery date, shipping method, message, and file attachments (Prescription, Order sheet).
- **Step 4: Review & Submit**: Summary of all details for final confirmation.

##### 3.4.1 RFQ Submission Result
- Success message and unique RFQ Number (e.g., RFQ-2026-0001).
- **Download PDF**: Immediate option to download the submitted RFQ in PDF format.
- Automated email notifications to Customer and Admin.

#### 3.5 Customer Portal
- **Login / Register**: Secure authentication for B2B clients.
- **Dashboard**:
  - Profile management.
  - **RFQ History**: List of all submitted RFQs with their current status (New, Under Review, Quotation Sent, Closed).
  - **Download Quotations**: If a quote is "Sent", the customer can download the formal Quotation PDF directly from the portal.

#### 3.6 RFQ Management Admin Panel
- **Dashboard**: Overview of new RFQs and active chat sessions.
- **RFQ Details**: View customer data, products, and attachments.
- **Status Management**: Update RFQ status.
- **Quotation Generator**: Tools to generate and send a formal Quotation PDF back to the customer.
- **Live Chat Console**: Interface for responding to customer messages in real-time.

---

### 4. Functional Requirements
| ID | Requirement |
|----|-------------|
| FR-01 | Users shall be able to browse products and categories. |
| FR-02 | Users shall be able to search and filter products. |
| FR-03 | Users shall be able to add products to an RFQ list. |
| FR-04 | Users shall be able to submit RFQ requests with attachments. |
| FR-05 | The system shall generate unique RFQ numbers upon submission. |
| FR-06 | The system shall send confirmation emails to customers and notifications to admins. |
| FR-07 | Admin shall be able to manage RFQs and update their status. |
| FR-08 | Admin shall be able to edit website content and product listings. |
| **FR-09** | **Users shall be able to register and log in to a secure portal.** |
| **FR-10** | **Customers shall be able to view their RFQ history and status.** |
| **FR-11** | **Users shall be able to compare selected products in a side-by-side view.** |
| **FR-12** | **The website shall support at least two languages with a toggle functionality.** |
| **FR-13** | **A live chat widget shall be available for real-time support.** |
| **FR-14** | **The system shall generate downloadable PDF versions of RFQs and Quotations.** |

---

### 5. Non-Functional Requirements
- **Performance**: Pages load < 3s; RFQ submit < 5s.
- **Security**: HTTPS, file scanning, secure password hashing (BCrypt), and JWT-based authentication.
- **Responsive Design**: Mobile-first approach for all pages.
- **SEO**: Meta tags, friendly URLs, sitemap, and schema markup for products.

---

### 6. Suggested Website Structure
- Home
- About Us
- Products (with Compare)
- Services
- RFQ Generator
- Contact Us
- Login / Register
- Customer Dashboard (History)
- Admin Panel (Restricted access)

---

### 7. Suggested Technology Stack
- **Frontend**: React (Next.js recommended for SEO), Tailwind CSS, Zustand/Redux for state.
- **Backend**: Node.js (Express) or Django.
- **Database**: PostgreSQL.
- **Real-time**: Socket.io or a 3rd party service (e.g., Tawk.to, Intercom) for Live Chat.
- **PDF**: `react-pdf`, `jspdf`, or `puppeteer` on the backend.
- **Localization**: `react-i18next`.

---

### 8. Suggested UI Flow
1. **Browse/Compare**: Visitor finds products, uses comparison.
2. **RFQ Selection**: Visitor adds items to RFQ.
3. **Login/Registration**: System prompts for login/signup if not authenticated.
4. **Step-based Wizard**: User completes the 4-step RFQ form.
5. **Confirmation**: PDF download and email triggers.
6. **Portal Access**: Customer checks status later via Dashboard.
