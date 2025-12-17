param(
  [string]$InputDir = "src/assets/monde1/png",
  [string]$OutputDir = "src/assets/monde1/normalized",
  [int]$AlphaThreshold = 1,
  [int]$Padding = 0,
  [switch]$CenterOnly
)

Add-Type -AssemblyName System.Drawing

if (-not (Test-Path $InputDir)) {
  throw "InputDir not found: $InputDir"
}

New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null

function Get-AlphaBounds {
  param(
    [System.Drawing.Bitmap]$Bitmap,
    [int]$Threshold
  )

  $minX = $Bitmap.Width
  $minY = $Bitmap.Height
  $maxX = -1
  $maxY = -1

  for ($y = 0; $y -lt $Bitmap.Height; $y++) {
    for ($x = 0; $x -lt $Bitmap.Width; $x++) {
      if ($Bitmap.GetPixel($x, $y).A -gt $Threshold) {
        if ($x -lt $minX) { $minX = $x }
        if ($y -lt $minY) { $minY = $y }
        if ($x -gt $maxX) { $maxX = $x }
        if ($y -gt $maxY) { $maxY = $y }
      }
    }
  }

  if ($maxX -lt 0) { return $null }

  [PSCustomObject]@{
    MinX = $minX
    MinY = $minY
    MaxX = $maxX
    MaxY = $maxY
    Width = $maxX - $minX + 1
    Height = $maxY - $minY + 1
  }
}

$items = Get-ChildItem -Path $InputDir -Filter *.png
if ($items.Count -eq 0) {
  throw "No PNG files found in $InputDir"
}

$boundsByFile = @{}
$maxWidth = 0
$maxHeight = 0

foreach ($file in $items) {
  $bmp = [System.Drawing.Bitmap]::FromFile($file.FullName)
  $bounds = Get-AlphaBounds -Bitmap $bmp -Threshold $AlphaThreshold
  $bmp.Dispose()
  if ($null -eq $bounds) { continue }
  $boundsByFile[$file.FullName] = $bounds
  if ($bounds.Width -gt $maxWidth) { $maxWidth = $bounds.Width }
  if ($bounds.Height -gt $maxHeight) { $maxHeight = $bounds.Height }
}

if ($maxWidth -le 0 -or $maxHeight -le 0) {
  throw "Could not compute bounds; check AlphaThreshold."
}

$targetWidth = $maxWidth + ($Padding * 2)
$targetHeight = $maxHeight + ($Padding * 2)

foreach ($file in $items) {
  if (-not $boundsByFile.ContainsKey($file.FullName)) { continue }
  $bounds = $boundsByFile[$file.FullName]
  $bmp = [System.Drawing.Bitmap]::FromFile($file.FullName)

  $canvas = New-Object System.Drawing.Bitmap($targetWidth, $targetHeight)
  $graphics = [System.Drawing.Graphics]::FromImage($canvas)
  $graphics.Clear([System.Drawing.Color]::Transparent)

  $destX = [Math]::Round(($targetWidth - $bounds.Width) / 2)
  $destY = if ($CenterOnly) {
    [Math]::Round(($targetHeight - $bounds.Height) / 2)
  } else {
    $targetHeight - $bounds.Height - $Padding
  }

  $destRect = New-Object System.Drawing.Rectangle($destX, $destY, $bounds.Width, $bounds.Height)
  $srcRect = New-Object System.Drawing.Rectangle($bounds.MinX, $bounds.MinY, $bounds.Width, $bounds.Height)

  $graphics.DrawImage($bmp, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

  $outputPath = Join-Path $OutputDir $file.Name
  $canvas.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

  $graphics.Dispose()
  $canvas.Dispose()
  $bmp.Dispose()
}

Write-Host "Normalized PNGs saved to $OutputDir"
