# Feature Specifications Directory

This directory contains detailed feature specifications that Claude Code can transform into complete User Stories using the `/features` command.

## Quick Start

### 1. Create a Specification File

Create a new file in this directory following the template:

```bash
.ai/specs/my-feature.md
```

See `example-feature.md` for a complete example.

### 2. Run the /features Command

In Claude Code, run:

```
/features .ai/specs/my-feature.md
```

Claude Code will:
- ✅ Read your specification file
- ✅ Auto-detect your project level (Rapid/Balanced/Crafted) from `.craftedrc.json`
- ✅ Generate complete User Stories adapted to your architecture
- ✅ Provide implementation order and testing strategy

### 3. Review and Implement

Claude Code will generate:
- Complete User Stories with acceptance criteria
- File structure following your level's architecture
- Code examples compatible with your stack
- Testing strategy for your level
- Implementation order

## Specification File Structure

Your specification file should include:

### Required Sections

- **Overview**: Problem statement, business goal, target users
- **User Stories**: Detailed stories with acceptance criteria
- **Technical Specifications**: Data models, API endpoints, dependencies
- **UI Components**: Pages and reusable components

### Optional Sections

- **Security & Permissions**: Auth and authorization requirements
- **Testing Requirements**: Critical flows and edge cases
- **Performance Considerations**: Indexes, caching, optimization
- **Notes & Constraints**: Limitations and future enhancements

## Example Files

### Minimal Specification (Rapid Level)

```markdown
# Feature Specification: Newsletter Signup

**Target Level**: Rapid

## Overview
Simple newsletter signup form with email validation.

## User Stories

### US-1: Signup Form
As a visitor, I want to subscribe to the newsletter.

#### Acceptance Criteria
- [ ] Email input with validation
- [ ] Submit button
- [ ] Success message after submission

## Technical Specifications

### Data Model
```prisma
model Subscriber {
  id        String   @id @default(cuid())
  email     String   @unique
  createdAt DateTime @default(now())
}
```

### API Endpoints
- `POST /api/trpc/newsletter.subscribe`
```

### Complete Specification (Crafted Level)

See `example-feature.md` for a comprehensive example including:
- Multiple user stories
- Detailed acceptance criteria
- Complete technical specifications
- UI/UX notes
- Security considerations
- Performance requirements

## Tips for Writing Good Specifications

### DO ✅

- **Be specific** about user needs and acceptance criteria
- **Include wireframes/mockups** when available
- **Document edge cases** and error states
- **Specify performance requirements** (indexes, caching)
- **List dependencies** and external services
- **Prioritize user stories** (High/Medium/Low)

### DON'T ❌

- Don't be too technical (let Claude Code handle architecture details)
- Don't specify implementation details (Claude Code adapts to your level)
- Don't forget acceptance criteria (they drive implementation)
- Don't skip UI/UX notes (they guide component design)

## File Naming Convention

Use descriptive, kebab-case names:

```
✅ Good:
- product-catalog.md
- user-authentication.md
- payment-processing.md
- admin-dashboard.md

❌ Bad:
- feature1.md
- new-feature.md
- TODO.md
```

## Auto-Detection

Claude Code automatically detects:

1. **Project Level** (from `.craftedrc.json`):
   - Rapid → Flat architecture
   - Balanced → 3-Layers architecture
   - Crafted → Hexagonal architecture

2. **Platform** (from `.craftedrc.json`):
   - Web Only → Next.js only
   - Web+Mobile → Next.js + React Native

You can override these in your spec file if needed.

## Next Steps

1. Review `example-feature.md` to understand the format
2. Create your own specification file
3. Run `/features .ai/specs/your-file.md` in Claude Code
4. Review generated User Stories
5. Start implementing!

## Need Help?

- Read the complete guide in `CLAUDE-WEB-TO-CODE.md`
- Check the User Story examples in `CLAUDE-WEB-TO-CODE.md`
- Review your project's architecture in `CLAUDE.md`
