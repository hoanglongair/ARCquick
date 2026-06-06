# ARCHITECTURE.md

## Purpose

ARCHITECTURE.md mô tả cấu trúc kỹ thuật tổng thể của hệ thống.

Mục tiêu:

* Giúp agent hiểu tổ chức codebase.
* Hạn chế việc tạo code sai tầng.
* Hỗ trợ review kiến trúc và refactor.

## Content Requirements

### Technology Stack

Ví dụ:

Frontend

* Next.js
* TypeScript

Backend

* Next.js Route Handlers
* Prisma

Database

* PostgreSQL

External Services

* Cloudinary
* SePay
* Gemini Vision

### Module Structure

Ví dụ:

src/
├── app/
├── modules/
├── services/
├── repositories/
├── lib/

### Layer Responsibilities

Ví dụ:

Controllers

* Nhận request.
* Trả response.

Services

* Chứa business logic.

Repositories

* Truy cập dữ liệu.

### Integration Overview

Ví dụ:

Client
→ API
→ Service
→ Repository
→ Database

## Update Rules

Agent chỉ cập nhật ARCHITECTURE.md khi:

* Thêm module lớn.
* Refactor kiến trúc.
* Thay đổi cách tổ chức code.
* Thêm external service quan trọng.

Không cập nhật sau mỗi task nhỏ.

ARCHITECTURE.md phải ổn định và thay đổi ít hơn PROJECT_STATE.md và SYSTEM_KNOWLEDGE.md.
