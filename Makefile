# AmbiSecure static site — convenience targets.
# The repo has no package.json; these wrap the shell scripts in tools/.
.PHONY: help deploy-build deploy-dry-run deploy-upload audit

help:
	@echo "Targets:"
	@echo "  make deploy-build    Build + audit + package the Hostinger artifact (no upload)"
	@echo "  make deploy-dry-run  Show what an upload would change (uploads nothing)"
	@echo "  make deploy-upload   Build, then upload to Hostinger (asks to confirm)"
	@echo "  make audit           Run the full audit suite (tools/audit-all.sh)"

# Default, safe: build + audit + package only. Never touches production.
deploy-build:
	bash tools/local-deploy.sh

# Preview the upload diff without writing anything (needs .deploy.env + lftp).
deploy-dry-run:
	bash tools/upload-hostinger.sh --dry-run

# Build then upload — the uploader prints a summary and asks for confirmation.
deploy-upload:
	bash tools/local-deploy.sh --upload

audit:
	bash tools/audit-all.sh
