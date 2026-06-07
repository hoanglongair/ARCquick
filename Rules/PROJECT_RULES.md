# ARCquick Project Rules

## Mục đích

Đây là bộ rules bắt buộc phải tuân thủ trong suốt quá trình phát triển dự án ARCquick.

---

## 1. Quy trình sau mỗi Task

Sau khi hoàn thành **mỗi task/feature**, agent PHẢI thực hiện đúng thứ tự:

### Bước 1: Update PROJECT_STATE.md
- Cập nhật trạng thái feature vừa hoàn thành
- Di chuyển từ "In Progress" → "Completed"
- Ghi chú ngày hoàn thành
- Cập nhật "Current Phase" nếu cần

### Bước 2: Update SYSTEM_KNOWLEDGE.md
- Chỉ update khi có thay đổi business flow
- Mô tả cách hệ thống hoạt động ở mức nghiệp vụ
- Không ghi chi tiết implementation

### Bước 3: Update CHANGELOG.md
- Thêm entry mới với format:
  ```
  ## [YYYY-MM-DD] - vX.X.X

  ### Added
  - [Feature description]

  ### Changed
  - [Modified feature]

  ### Fixed
  - [Bug fix]
  ```
- Liệt kê tất cả thay đổi trong task đó
- Tách version rõ ràng cho từng phase/feature, tránh gom nhiều thay đổi không liên quan vào một entry
- Không dùng `(COMPLETED)` — changelog dành cho người đọc, không phải internal tracker
- Feature nhỏ có thể gom vào cùng version, nhưng bug fix phải tách section `Fixed` riêng

### Bước 4: Self Review
- Kiểm tra code có hoạt động đúng không
- Kiểm tra type safety (TypeScript)
- Kiểm tra error handling
- Đảm bảo không có console.log thừa
- Đảm bảo naming convention nhất quán

### Bước 5: Regression Check
- Kiểm tra các features đã hoàn thành trước đó vẫn hoạt động
- Chạy lại các test cases cơ bản
- Kiểm tra imports/exports không bị broken

### Bước 6: Report Modified Files
- Liệt kê tất cả files đã tạo/sửa đổi
- Báo cáo tóm tắt changes

---

## 2. Cấu trúc Docs

```
ARCquick/
├── Docs/
│   ├── ARCHITECTURE.md      # Cấu trúc kỹ thuật (ít thay đổi)
│   ├── PROJECT_STATE.md     # Trạng thái dự án (thường xuyên cập nhật)
│   ├── SYSTEM_KNOWLEDGE.md  # Business flows (cập nhật khi flow thay đổi)
│   └── CHANGELOG.md         # Lịch sử thay đổi (luôn cập nhật sau task)
├── Rules/
│   └── PROJECT_RULES.md     # File này
```

---

## 3. Commit Convention

Sử dụng conventional commits:

```
feat: new feature
fix: bug fix
docs: documentation changes
refactor: code refactoring
style: formatting
test: testing
chore: maintenance
```

---

## 4. Code Standards

### TypeScript
- Luôn sử dụng explicit types
- Tránh `any`, sử dụng `unknown` khi cần
- Export types cùng file với implementation

### React/Next.js
- Sử dụng Server Components khi có thể
- Client components chỉ khi cần interactivity
- Custom hooks cho logic reuse

### Naming
- Components: PascalCase (UserCard.tsx)
- Functions/Variables: camelCase (getUserBalance)
- Constants: SCREAMING_SNAKE_CASE (API_URL)
- Types/Interfaces: PascalCase (UserBalance)

---

## 5. Testing Requirements

- Mỗi feature mới phải có manual test
- Kiểm tra error cases
- Kiểm tra loading states

---

## 6. Documentation Requirements

### Code Comments
- Chỉ comment khi logic không tự giải thích được
- Tránh comments hiển nhiên

### README Updates
- Cập nhật README khi có thay đổi lớn
- Hướng dẫn setup mới

---

## 7. Exit Context Checklist

Trước khi kết thúc session, đảm bảo:

- [ ] PROJECT_STATE.md đã được cập nhật
- [ ] SYSTEM_KNOWLEDGE.md đã được cập nhật (nếu có thay đổi)
- [ ] CHANGELOG.md đã được cập nhật
- [ ] Không có lỗi compile/syntax
- [ ] Tất cả files đã save


## Important!!!

Before reading the entire codebase, always read:

1. docs/PROJECT_STATE.md (trạng thái dự án hiện tại - PHẢI đọc trước)
2. docs/SYSTEM_KNOWLEDGE.md (business flows)
3. docs/ARCHITECTURE.md (cấu trúc kỹ thuật)

Only scan source code when required.

Agents are not allowed to modify the rules without explicit user approval.


## Current Phase Tracking

Luôn giữ PROJECT_STATE.md khớp với trạng thái thực tế. Trước mỗi task:

1. Đọc PROJECT_STATE.md để biết đang ở phase nào
2. Check "In Progress Features" trước khi bắt đầu
3. Check "Pending Features" để biết còn gì phải làm
4. Sau task: update PROJECT_STATE.md + CHANGELOG.md + build verify

## Project Phase Overview

```
Phase 1: Core MVP         ✅ COMPLETED
Phase 2: Enhanced Features ✅ COMPLETED
Phase 3: Advanced          ⏳ IN PROGRESS (3.1✅ 3.2✅ 3.3✅ 3.4⏳)
Phase 4: Security          ⏳ PENDING
Phase 5: UX               ⏳ PENDING
```

## Quick Reference - File Locations

- Components chính: `src/components/`
- Hooks: `src/hooks/`
- Stores (Zustand): `src/stores/`
- Lib utilities: `src/lib/`
- Pages/routes: `src/app/`
- Docs: `Docs/`
- Rules: `Rules/`