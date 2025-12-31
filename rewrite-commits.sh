#!/bin/bash

# Script to rewrite commit messages

cat <<'EOF' | git filter-branch -f --msg-filter 'cat > /tmp/msg.$$ ; 
MSG=$(cat /tmp/msg.$$)
case "$MSG" in
"MVP")
cat <<MSG
feat: initialize Next.js AI agent chatbot project

- Set up Next.js 15 with TypeScript and Tailwind CSS
- Implement AI agent with Anthropic Claude Sonnet 4.5
- Add calculator and weather tools
- Create chat UI with streaming support
- Configure development environment with Bun
MSG
;;
"Enhancements")
cat <<MSG
feat: add markdown rendering and improve UI styling

- Integrate react-markdown with remark-gfm for GitHub Flavored Markdown
- Add markdown table support
- Enhance chat interface styling
- Improve UI component layout and spacing
MSG
;;
"Fixes")
cat <<MSG
refactor: modularize chat UI into reusable components

- Extract chat components into separate files:
  - ChatHeader for top navigation
  - ChatInput for message input
  - MessageList for message display
  - TextBubble and ToolCallBubble for message rendering
  - EmptyState and ErrorMessage for states
- Add animation tracking hooks (useAnimationTracking, useAutoScroll)
- Clean up .next build artifacts from Git tracking
- Update .gitignore to exclude build files
MSG
;;
"style tweaks")
cat <<MSG
fix: improve auto-scroll behavior and tool call UI

- Refine auto-scroll timing for better UX
- Adjust tool call bubble padding and spacing
- Fine-tune animation transitions
MSG
;;
"fix: untrack .next directory")
cat <<MSG
fix: remove .next build directory from Git tracking

- Delete accidentally committed .next directory (181 files)
- Build artifacts should not be in version control
- Already covered by .gitignore
MSG
;;
"Update README.md")
cat <<MSG
docs: update README with project information

- Add project description and setup instructions
MSG
;;
"fixes")
cat <<MSG
chore: update dependencies and refine chat input styling

- Update bun.lock with latest dependency resolutions
- Adjust chat input component styling
MSG
;;
"Text input style")
cat <<MSG
style: refine chat input component appearance

- Adjust visual styling of text input field
MSG
;;
"remove hardcoded api keys")
cat <<MSG
security: remove hardcoded API keys from codebase

- Move API keys to environment variables in config
- Add fallback handling for missing keys
- Improve security by not committing sensitive data
MSG
;;
*)
cat /tmp/msg.$$
;;
esac
rm -f /tmp/msg.$$
' -- --all
EOF

