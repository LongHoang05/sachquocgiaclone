Add-Type -AssemblyName System.Security

# Tìm Chrome Cookies file
$chromePaths = @(
    "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Network\Cookies",
    "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Cookies",
    "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Network\Cookies",
    "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Cookies"
)

$cookieDbPath = $null
foreach ($p in $chromePaths) {
    if (Test-Path $p) { $cookieDbPath = $p; break }
}

if (-not $cookieDbPath) {
    Write-Error "Không tìm thấy Chrome Cookies file!"
    exit 1
}

Write-Host "Đọc từ: $cookieDbPath"

# Copy file (vì Chrome có thể lock, dùng robocopy bypass)
$tmpPath = "$env:TEMP\chrome_cookies_tmp.db"
$dbDir = Split-Path $cookieDbPath
$dbFile = Split-Path -Leaf $cookieDbPath

# Dùng robocopy để copy file đang bị lock
$null = robocopy $dbDir $env:TEMP $dbFile /B /NFL /NDL /NJH /NJS 2>&1
if (-not (Test-Path $tmpPath)) {
    # Fallback: copy thường
    try { Copy-Item $cookieDbPath $tmpPath -Force } catch { Write-Error "Không thể copy: $_"; exit 1 }
}

Write-Host "Đã copy sang temp"

# Đọc SQLite bằng System.Data.SQLite (nếu có) hoặc dùng binary parsing đơn giản
# Thực ra: lấy encrypted_value từ SQLite cần driver
# Cách dễ nhất trên Windows: dùng PowerShell với PInvoke để gọi sqlite3.dll

# Thay vào đó, chúng ta sử dụng chrome-cookies-secure package từ Node.js
# Nhưng trước tiên hãy thử lấy "Local State" để decode encryption key mới (Chrome 80+)

$localStatePath = Join-Path (Split-Path (Split-Path $cookieDbPath)) "Local State"
if (Test-Path $localStatePath) {
    Write-Host "Tìm thấy Local State"
    $localState = Get-Content $localStatePath -Raw | ConvertFrom-Json
    $encryptedKey = $localState.os_crypt.encrypted_key
    Write-Host "Encrypted key (base64, 50 chars): $($encryptedKey.Substring(0, [Math]::Min(50, $encryptedKey.Length)))..."
    
    # Decode base64 key
    $keyBytes = [System.Convert]::FromBase64String($encryptedKey)
    # Bỏ 5 bytes prefix "DPAPI"
    $keyWithoutPrefix = $keyBytes[5..($keyBytes.Length-1)]
    
    # Decrypt bằng DPAPI
    $decryptedKey = [System.Security.Cryptography.ProtectedData]::Unprotect(
        $keyWithoutPrefix, $null, 
        [System.Security.Cryptography.DataProtectionScope]::CurrentUser
    )
    
    $keyBase64 = [System.Convert]::ToBase64String($decryptedKey)
    Write-Host "Decrypted AES key (base64): $keyBase64"
    
    # Lưu key để Node.js decrypt cookies
    $keyBase64 | Set-Content "$PSScriptRoot\_chrome_key.txt"
    Write-Host "Key saved to _chrome_key.txt"
} else {
    Write-Host "Không tìm thấy Local State (Chrome < 80)"
}

# Cleanup
Remove-Item $tmpPath -ErrorAction SilentlyContinue

Write-Host "Done"
