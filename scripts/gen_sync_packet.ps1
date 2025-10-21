[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
function ToAscii([string]$s){ $s -replace '[^\u0000-\u007F]', '' }

Write-Output "[SYNC PACKET]"
Write-Output ("Datetime: " + (Get-Date -Format "yyyy-MM-dd HH:mm:ss"))
Write-Output "Flags:"
Write-Output "Changes (WBS/Tasks):"
Write-Output "  - "
Write-Output "Today's Top 3:"
Write-Output "  1) "
Write-Output "  2) "
Write-Output "  3) "
Write-Output "Activity (Git):"
Write-Output "  - Recent commits:"
git log --since="yesterday" --oneline | ForEach-Object { "    $(ToAscii($_))" }
Write-Output "  - Diff summary:"
git diff --stat origin/main...HEAD | ForEach-Object { "    $(ToAscii($_))" }
Write-Output "Artifacts/Links:"
Write-Output "  - "
Write-Output "Blockers/Questions:"
Write-Output "  - "
Write-Output "Next Actions:"
Write-Output "  - [ ] "
Write-Output "  - [ ] "
Write-Output "  - [ ] "
