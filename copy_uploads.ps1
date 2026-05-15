$src = "c:\Users\shrad\OneDrive\Desktop\rainbow preschool\preschool\frontend\uploads"
$dst = "c:\Users\shrad\OneDrive\Desktop\rainbow preschool\preschool\frontend\assets\uploads"

$files = Get-ChildItem $src -File
Write-Host "Found $($files.Count) files in uploads/ to copy..." -ForegroundColor Cyan

foreach ($f in $files) {
    $destPath = Join-Path $dst $f.Name
    Copy-Item $f.FullName -Destination $destPath -Force
    Write-Host "  Copied: $($f.Name)  ($([math]::Round($f.Length/1KB, 1)) KB)" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== assets/uploads/ now contains ===" -ForegroundColor Cyan
$result = Get-ChildItem $dst -File
foreach ($f in $result) {
    Write-Host "  $($f.Name)  ($([math]::Round($f.Length/1KB, 1)) KB)" -ForegroundColor White
}
Write-Host ""
Write-Host "Total: $($result.Count) files in assets/uploads/" -ForegroundColor Green
