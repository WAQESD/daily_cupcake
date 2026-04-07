Add-Type -AssemblyName System.Drawing

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function New-Color {
  param(
    [Parameter(Mandatory)]
    [string] $Hex,
    [int] $Alpha = 255
  )

  $value = $Hex.TrimStart("#")
  if ($value.Length -ne 6) {
    throw "Expected 6-digit hex color, got '$Hex'."
  }

  $r = [Convert]::ToInt32($value.Substring(0, 2), 16)
  $g = [Convert]::ToInt32($value.Substring(2, 2), 16)
  $b = [Convert]::ToInt32($value.Substring(4, 2), 16)

  return [System.Drawing.Color]::FromArgb($Alpha, $r, $g, $b)
}

function New-RectF {
  param(
    [float] $X,
    [float] $Y,
    [float] $Width,
    [float] $Height
  )

  return [System.Drawing.RectangleF]::new($X, $Y, $Width, $Height)
}

function New-RoundedPath {
  param(
    [float] $X,
    [float] $Y,
    [float] $Width,
    [float] $Height,
    [float] $Radius
  )

  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  if ($Radius -le 0) {
    $path.AddRectangle((New-RectF $X $Y $Width $Height))
    $path.CloseFigure()
    return $path
  }

  $diameter = [Math]::Min($Radius * 2, [Math]::Min($Width, $Height))

  $path.AddArc($X, $Y, $diameter, $diameter, 180, 90)
  $path.AddArc($X + $Width - $diameter, $Y, $diameter, $diameter, 270, 90)
  $path.AddArc($X + $Width - $diameter, $Y + $Height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($X, $Y + $Height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()

  return $path
}

function Fill-BackgroundGradient {
  param(
    [System.Drawing.Graphics] $Graphics,
    [int] $Width,
    [int] $Height,
    [string] $Top,
    [string] $Bottom
  )

  $brush = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
    (New-RectF 0 0 $Width $Height),
    (New-Color $Top),
    (New-Color $Bottom),
    90
  )
  try {
    $Graphics.FillRectangle($brush, 0, 0, $Width, $Height)
  }
  finally {
    $brush.Dispose()
  }
}

function Add-Glow {
  param(
    [System.Drawing.Graphics] $Graphics,
    [float] $CenterX,
    [float] $CenterY,
    [float] $Radius,
    [string] $Color,
    [int] $Alpha = 180
  )

  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $diameter = $Radius * 2
  $path.AddEllipse($CenterX - $Radius, $CenterY - $Radius, $diameter, $diameter)

  $brush = New-Object System.Drawing.Drawing2D.PathGradientBrush($path)
  try {
    $brush.CenterColor = New-Color $Color $Alpha
    $brush.SurroundColors = [System.Drawing.Color[]] @([System.Drawing.Color]::FromArgb(0, 255, 255, 255))
    $Graphics.FillPath($brush, $path)
  }
  finally {
    $brush.Dispose()
    $path.Dispose()
  }
}

function Fill-RoundedRect {
  param(
    [System.Drawing.Graphics] $Graphics,
    [System.Drawing.Brush] $Brush,
    [float] $X,
    [float] $Y,
    [float] $Width,
    [float] $Height,
    [float] $Radius
  )

  $path = New-RoundedPath -X $X -Y $Y -Width $Width -Height $Height -Radius $Radius
  try {
    $Graphics.FillPath($Brush, $path)
  }
  finally {
    $path.Dispose()
  }
}

function Draw-RoundedRectOutline {
  param(
    [System.Drawing.Graphics] $Graphics,
    [System.Drawing.Pen] $Pen,
    [float] $X,
    [float] $Y,
    [float] $Width,
    [float] $Height,
    [float] $Radius
  )

  $path = New-RoundedPath -X $X -Y $Y -Width $Width -Height $Height -Radius $Radius
  try {
    $Graphics.DrawPath($Pen, $path)
  }
  finally {
    $path.Dispose()
  }
}

function Draw-StripedAwning {
  param(
    [System.Drawing.Graphics] $Graphics,
    [float] $X,
    [float] $Y,
    [float] $Width,
    [float] $Height,
    [string] $Primary,
    [string] $Secondary
  )

  $stripeWidth = $Width / 8
  for ($index = 0; $index -lt 8; $index++) {
    $left = $X + ($index * $stripeWidth)
    $points = [System.Drawing.PointF[]] @(
      [System.Drawing.PointF]::new($left, $Y),
      [System.Drawing.PointF]::new($left + $stripeWidth, $Y),
      [System.Drawing.PointF]::new($left + ($stripeWidth * 0.88), $Y + $Height),
      [System.Drawing.PointF]::new($left + ($stripeWidth * 0.12), $Y + $Height)
    )
    $brushColor = if ($index % 2 -eq 0) { $Primary } else { $Secondary }
    $brush = New-Object System.Drawing.SolidBrush (New-Color $brushColor)
    try {
      $Graphics.FillPolygon($brush, $points)
    }
    finally {
      $brush.Dispose()
    }
  }
}

function Draw-Cloud {
  param(
    [System.Drawing.Graphics] $Graphics,
    [float] $X,
    [float] $Y,
    [float] $Scale,
    [string] $Color,
    [int] $Alpha = 180
  )

  $brush = New-Object System.Drawing.SolidBrush (New-Color $Color $Alpha)
  try {
    $Graphics.FillEllipse($brush, $X, $Y + (34 * $Scale), 126 * $Scale, 56 * $Scale)
    $Graphics.FillEllipse($brush, $X + (18 * $Scale), $Y + (10 * $Scale), 72 * $Scale, 74 * $Scale)
    $Graphics.FillEllipse($brush, $X + (56 * $Scale), $Y, 78 * $Scale, 82 * $Scale)
    $Graphics.FillEllipse($brush, $X + (98 * $Scale), $Y + (18 * $Scale), 66 * $Scale, 64 * $Scale)
  }
  finally {
    $brush.Dispose()
  }
}

function Draw-Sparkle {
  param(
    [System.Drawing.Graphics] $Graphics,
    [float] $CenterX,
    [float] $CenterY,
    [float] $Radius
  )

  $pen = [System.Drawing.Pen]::new((New-Color "#FFF9FF" 220), [Math]::Max(2, $Radius / 5))
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  try {
    $Graphics.DrawLine($pen, $CenterX, $CenterY - $Radius, $CenterX, $CenterY + $Radius)
    $Graphics.DrawLine($pen, $CenterX - $Radius, $CenterY, $CenterX + $Radius, $CenterY)
  }
  finally {
    $pen.Dispose()
  }
}

function Draw-Cupcake {
  param(
    [System.Drawing.Graphics] $Graphics,
    [float] $CenterX,
    [float] $BottomY,
    [float] $Scale,
    [string] $Cake,
    [string] $Wrapper,
    [string] $Cream,
    [string] $Accent
  )

  $wrapperPoints = [System.Drawing.PointF[]] @(
    [System.Drawing.PointF]::new($CenterX - (42 * $Scale), $BottomY - (48 * $Scale)),
    [System.Drawing.PointF]::new($CenterX + (42 * $Scale), $BottomY - (48 * $Scale)),
    [System.Drawing.PointF]::new($CenterX + (55 * $Scale), $BottomY),
    [System.Drawing.PointF]::new($CenterX - (55 * $Scale), $BottomY)
  )

  $wrapperBrush = New-Object System.Drawing.SolidBrush (New-Color $Wrapper)
  $cakeBrush = New-Object System.Drawing.SolidBrush (New-Color $Cake)
  $creamBrush = New-Object System.Drawing.SolidBrush (New-Color $Cream)
  $accentBrush = New-Object System.Drawing.SolidBrush (New-Color $Accent)
  $outlinePen = [System.Drawing.Pen]::new((New-Color "#FFFDFD" 210), [Math]::Max(2, 5 * $Scale))
  $outlinePen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

  try {
    $Graphics.FillPolygon($wrapperBrush, $wrapperPoints)
    for ($index = -4; $index -le 4; $index++) {
      $lineX = $CenterX + ($index * 12 * $Scale)
      $Graphics.DrawLine($outlinePen, $lineX, $BottomY - (44 * $Scale), $lineX + (6 * $Scale), $BottomY - (2 * $Scale))
    }

    $cakeRect = New-RectF ($CenterX - (48 * $Scale)) ($BottomY - (86 * $Scale)) (96 * $Scale) (42 * $Scale)
    $Graphics.FillEllipse($cakeBrush, $cakeRect)

    $Graphics.FillEllipse($creamBrush, $CenterX - (62 * $Scale), $BottomY - (138 * $Scale), 124 * $Scale, 62 * $Scale)
    $Graphics.FillEllipse($creamBrush, $CenterX - (44 * $Scale), $BottomY - (174 * $Scale), 88 * $Scale, 68 * $Scale)
    $Graphics.FillEllipse($creamBrush, $CenterX - (26 * $Scale), $BottomY - (206 * $Scale), 52 * $Scale, 52 * $Scale)
    $Graphics.FillEllipse($accentBrush, $CenterX - (12 * $Scale), $BottomY - (204 * $Scale), 24 * $Scale, 24 * $Scale)
  }
  finally {
    $wrapperBrush.Dispose()
    $cakeBrush.Dispose()
    $creamBrush.Dispose()
    $accentBrush.Dispose()
    $outlinePen.Dispose()
  }
}

function Add-Confetti {
  param(
    [System.Drawing.Graphics] $Graphics,
    [int] $Width,
    [int] $Height,
    [int] $Count,
    [System.Random] $Random
  )

  $palette = @("#FFD56E", "#FFA2C2", "#FFF5C7", "#F8B7D4", "#FEE9F3")

  for ($index = 0; $index -lt $Count; $index++) {
    $size = 8 + $Random.NextDouble() * 28
    $x = $Random.NextDouble() * $Width
    $y = $Random.NextDouble() * $Height
    $color = $palette[$Random.Next(0, $palette.Length)]
    $alpha = 18 + $Random.Next(10, 70)
    $brush = New-Object System.Drawing.SolidBrush (New-Color $color $alpha)
    try {
      if ($Random.NextDouble() -gt 0.55) {
        $Graphics.FillEllipse($brush, $x, $y, $size, $size)
      }
      else {
        $Graphics.FillRectangle($brush, $x, $y, $size, [Math]::Max(3, $size * 0.35))
      }
    }
    finally {
      $brush.Dispose()
    }
  }
}

function Save-Bitmap {
  param(
    [System.Drawing.Bitmap] $Bitmap,
    [string] $Path
  )

  $target = Resolve-Path -LiteralPath (Split-Path -Parent $Path)
  $fullPath = Join-Path $target (Split-Path -Leaf $Path)
  $Bitmap.Save($fullPath, [System.Drawing.Imaging.ImageFormat]::Png)
}

function New-Canvas {
  param(
    [int] $Width,
    [int] $Height
  )

  $bitmap = [System.Drawing.Bitmap]::new($Width, $Height)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

  return @{
    Bitmap = $bitmap
    Graphics = $graphics
  }
}

function Render-HeroScene {
  param([string] $Path)

  $canvas = New-Canvas -Width 1024 -Height 1536
  $bitmap = $canvas.Bitmap
  $g = $canvas.Graphics
  $random = [System.Random]::new(12)

  try {
    Fill-BackgroundGradient -Graphics $g -Width 1024 -Height 1536 -Top "#FFF7FB" -Bottom "#FFC8DE"
    Add-Glow -Graphics $g -CenterX 230 -CenterY 240 -Radius 280 -Color "#FFFDF5" -Alpha 210
    Add-Glow -Graphics $g -CenterX 760 -CenterY 460 -Radius 420 -Color "#FFB8D3" -Alpha 150
    Draw-Cloud -Graphics $g -X 86 -Y 128 -Scale 1.3 -Color "#FFFFFF" -Alpha 180
    Draw-Cloud -Graphics $g -X 708 -Y 206 -Scale 1.05 -Color "#FFF9FF" -Alpha 160

    $hillBrush = New-Object System.Drawing.SolidBrush (New-Color "#FFD4E5")
    $laneBrush = New-Object System.Drawing.SolidBrush (New-Color "#FFF0D8")
    $villageBrush = New-Object System.Drawing.SolidBrush (New-Color "#F7BAD0" 148)
    $windowBrush = New-Object System.Drawing.SolidBrush (New-Color "#FFF6F3" 230)
    $outline = [System.Drawing.Pen]::new((New-Color "#FFF9FF" 210), 8)

    try {
      $g.FillEllipse($hillBrush, -160, 980, 760, 460)
      $g.FillEllipse($hillBrush, 440, 942, 720, 500)
      $g.FillEllipse($laneBrush, 324, 1040, 390, 360)

      Fill-RoundedRect -Graphics $g -Brush $villageBrush -X 94 -Y 694 -Width 148 -Height 248 -Radius 30
      Fill-RoundedRect -Graphics $g -Brush $villageBrush -X 804 -Y 664 -Width 126 -Height 228 -Radius 30
      Fill-RoundedRect -Graphics $g -Brush $windowBrush -X 126 -Y 742 -Width 42 -Height 58 -Radius 14
      Fill-RoundedRect -Graphics $g -Brush $windowBrush -X 172 -Y 742 -Width 42 -Height 58 -Radius 14
      Fill-RoundedRect -Graphics $g -Brush $windowBrush -X 838 -Y 706 -Width 54 -Height 66 -Radius 16

      $storeBrush = New-Object System.Drawing.SolidBrush (New-Color "#FFE7F0")
      $roofBrush = New-Object System.Drawing.SolidBrush (New-Color "#F59CBC")
      $trimBrush = New-Object System.Drawing.SolidBrush (New-Color "#FFCF77")
      $doorBrush = New-Object System.Drawing.SolidBrush (New-Color "#FFD8E7")
      try {
        Fill-RoundedRect -Graphics $g -Brush $storeBrush -X 244 -Y 532 -Width 536 -Height 600 -Radius 54
        Fill-RoundedRect -Graphics $g -Brush $roofBrush -X 208 -Y 472 -Width 608 -Height 114 -Radius 54
        Fill-RoundedRect -Graphics $g -Brush $trimBrush -X 244 -Y 1106 -Width 536 -Height 30 -Radius 14
        Draw-StripedAwning -Graphics $g -X 254 -Y 594 -Width 516 -Height 126 -Primary "#FFD6E8" -Secondary "#FFF7F1"

        Fill-RoundedRect -Graphics $g -Brush $windowBrush -X 316 -Y 784 -Width 132 -Height 180 -Radius 36
        Fill-RoundedRect -Graphics $g -Brush $windowBrush -X 578 -Y 784 -Width 132 -Height 180 -Radius 36
        Fill-RoundedRect -Graphics $g -Brush $doorBrush -X 458 -Y 746 -Width 110 -Height 274 -Radius 42

        $g.DrawLine($outline, 382, 784, 382, 964)
        $g.DrawLine($outline, 644, 784, 644, 964)
        $g.DrawLine($outline, 316, 874, 448, 874)
        $g.DrawLine($outline, 578, 874, 710, 874)
      }
      finally {
        $storeBrush.Dispose()
        $roofBrush.Dispose()
        $trimBrush.Dispose()
        $doorBrush.Dispose()
      }
    }
    finally {
      $hillBrush.Dispose()
      $laneBrush.Dispose()
      $villageBrush.Dispose()
      $windowBrush.Dispose()
      $outline.Dispose()
    }

    Draw-Cupcake -Graphics $g -CenterX 356 -BottomY 1184 -Scale 0.78 -Cake "#FFC27A" -Wrapper "#FFD9E8" -Cream "#FFF4FB" -Accent "#FF7DAA"
    Draw-Cupcake -Graphics $g -CenterX 512 -BottomY 1202 -Scale 0.95 -Cake "#E6A05D" -Wrapper "#FFF1C4" -Cream "#FFDDF1" -Accent "#FFC95F"
    Draw-Cupcake -Graphics $g -CenterX 658 -BottomY 1188 -Scale 0.8 -Cake "#F0B06A" -Wrapper "#FFD4E7" -Cream "#FFF6FC" -Accent "#FF89B3"

    for ($index = 0; $index -lt 13; $index++) {
      Draw-Sparkle -Graphics $g -CenterX (120 + ($index * 62)) -CenterY (180 + ($random.NextDouble() * 1080)) -Radius (6 + ($random.NextDouble() * 12))
    }

    Add-Confetti -Graphics $g -Width 1024 -Height 1536 -Count 170 -Random $random
    Save-Bitmap -Bitmap $bitmap -Path $Path
  }
  finally {
    $g.Dispose()
    $bitmap.Dispose()
  }
}

function Render-OvenScene {
  param([string] $Path)

  $canvas = New-Canvas -Width 1536 -Height 1024
  $bitmap = $canvas.Bitmap
  $g = $canvas.Graphics
  $random = [System.Random]::new(24)

  try {
    Fill-BackgroundGradient -Graphics $g -Width 1536 -Height 1024 -Top "#FFF8FC" -Bottom "#FFD4E6"
    Add-Glow -Graphics $g -CenterX 760 -CenterY 360 -Radius 360 -Color "#FFF5D8" -Alpha 220
    Add-Glow -Graphics $g -CenterX 1240 -CenterY 228 -Radius 280 -Color "#FFBED7" -Alpha 120

    $wallBrush = New-Object System.Drawing.SolidBrush (New-Color "#FFF0F6" 170)
    $counterBrush = New-Object System.Drawing.SolidBrush (New-Color "#FFE2EB")
    $woodBrush = New-Object System.Drawing.SolidBrush (New-Color "#F3B18D")
    $shelfBrush = New-Object System.Drawing.SolidBrush (New-Color "#FFC6DD")
    $glassBrush = New-Object System.Drawing.SolidBrush (New-Color "#FFFFFF" 170)
    $outline = [System.Drawing.Pen]::new((New-Color "#FFF8FF" 220), 7)

    try {
      Fill-RoundedRect -Graphics $g -Brush $wallBrush -X 106 -Y 122 -Width 1324 -Height 616 -Radius 54
      Fill-RoundedRect -Graphics $g -Brush $counterBrush -X 0 -Y 720 -Width 1536 -Height 304 -Radius 0
      Fill-RoundedRect -Graphics $g -Brush $woodBrush -X 0 -Y 710 -Width 1536 -Height 62 -Radius 0
      Fill-RoundedRect -Graphics $g -Brush $shelfBrush -X 170 -Y 226 -Width 380 -Height 30 -Radius 15
      Fill-RoundedRect -Graphics $g -Brush $shelfBrush -X 980 -Y 220 -Width 332 -Height 30 -Radius 15

      $archPath = New-Object System.Drawing.Drawing2D.GraphicsPath
      $archPath.AddArc(510, 142, 516, 450, 180, 180)
      $archPath.AddLine(1026, 366, 1026, 618)
      $archPath.AddLine(1026, 618, 510, 618)
      $archPath.AddLine(510, 618, 510, 366)
      $archPath.CloseFigure()

      $archBrush = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
        (New-RectF 510 142 516 476),
        (New-Color "#FFD2E5"),
        (New-Color "#FFF7EE"),
        90
      )

      try {
        $g.FillPath($archBrush, $archPath)
        $g.DrawPath($outline, $archPath)
      }
      finally {
        $archBrush.Dispose()
        $archPath.Dispose()
      }

      Fill-RoundedRect -Graphics $g -Brush $glassBrush -X 600 -Y 258 -Width 336 -Height 196 -Radius 54
      Fill-RoundedRect -Graphics $g -Brush $glassBrush -X 632 -Y 488 -Width 270 -Height 82 -Radius 28
    }
    finally {
      $wallBrush.Dispose()
      $counterBrush.Dispose()
      $woodBrush.Dispose()
      $shelfBrush.Dispose()
      $glassBrush.Dispose()
      $outline.Dispose()
    }

    foreach ($center in @(
      @{ X = 262; Y = 248; Size = 58; Color = "#FFE07B" },
      @{ X = 340; Y = 244; Size = 66; Color = "#FFD4E7" },
      @{ X = 430; Y = 246; Size = 50; Color = "#FFF1BE" },
      @{ X = 1064; Y = 238; Size = 58; Color = "#FFF3C5" },
      @{ X = 1142; Y = 242; Size = 72; Color = "#FFD7E9" },
      @{ X = 1242; Y = 240; Size = 54; Color = "#FFC773" }
    )) {
      $brush = New-Object System.Drawing.SolidBrush (New-Color $center.Color 180)
      try {
        Fill-RoundedRect -Graphics $g -Brush $brush -X ($center.X - ($center.Size / 2)) -Y ($center.Y - $center.Size) -Width $center.Size -Height ($center.Size * 1.4) -Radius 20
      }
      finally {
        $brush.Dispose()
      }
    }

    $bowlShadow = New-Object System.Drawing.SolidBrush (New-Color "#D58AAE" 48)
    $bowlBrush = New-Object System.Drawing.SolidBrush (New-Color "#FFD8E6")
    $bowlCream = New-Object System.Drawing.SolidBrush (New-Color "#FFF5FB")
    try {
      foreach ($item in @(
        @{ X = 262; Y = 790; Width = 190; Height = 72 },
        @{ X = 1180; Y = 804; Width = 206; Height = 82 }
      )) {
        $g.FillEllipse($bowlShadow, $item.X - 16, $item.Y + 32, $item.Width + 32, $item.Height * 0.8)
        $g.FillEllipse($bowlBrush, $item.X, $item.Y, $item.Width, $item.Height)
        $g.FillEllipse($bowlCream, $item.X + 24, $item.Y - 22, $item.Width - 48, $item.Height)
      }
    }
    finally {
      $bowlShadow.Dispose()
      $bowlBrush.Dispose()
      $bowlCream.Dispose()
    }

    Draw-Cupcake -Graphics $g -CenterX 1090 -BottomY 736 -Scale 0.58 -Cake "#F0B167" -Wrapper "#FFE7F1" -Cream "#FFF6FD" -Accent "#FF83AB"
    Draw-Cupcake -Graphics $g -CenterX 1218 -BottomY 742 -Scale 0.52 -Cake "#E7A45E" -Wrapper "#FFF0C8" -Cream "#FFE5F3" -Accent "#FFCC64"
    Draw-Cupcake -Graphics $g -CenterX 1328 -BottomY 744 -Scale 0.5 -Cake "#F1B775" -Wrapper "#FFDCE9" -Cream "#FFF9FD" -Accent "#FF96BB"

    for ($index = 0; $index -lt 18; $index++) {
      $x = 178 + ($index * 72)
      Draw-Sparkle -Graphics $g -CenterX $x -CenterY (150 + ($random.NextDouble() * 720)) -Radius (5 + ($random.NextDouble() * 10))
    }

    Add-Confetti -Graphics $g -Width 1536 -Height 1024 -Count 140 -Random $random
    Save-Bitmap -Bitmap $bitmap -Path $Path
  }
  finally {
    $g.Dispose()
    $bitmap.Dispose()
  }
}

function Render-ShowcaseScene {
  param([string] $Path)

  $canvas = New-Canvas -Width 1536 -Height 1024
  $bitmap = $canvas.Bitmap
  $g = $canvas.Graphics
  $random = [System.Random]::new(48)

  try {
    Fill-BackgroundGradient -Graphics $g -Width 1536 -Height 1024 -Top "#FFF8FC" -Bottom "#FFD6E5"
    Add-Glow -Graphics $g -CenterX 760 -CenterY 180 -Radius 320 -Color "#FFF8E4" -Alpha 220
    Add-Glow -Graphics $g -CenterX 280 -CenterY 280 -Radius 280 -Color "#FFCAE0" -Alpha 110

    $backPanelBrush = New-Object System.Drawing.SolidBrush (New-Color "#FFF0F6" 185)
    $archBrush = New-Object System.Drawing.SolidBrush (New-Color "#FFE3EF")
    $shelfBrush = New-Object System.Drawing.SolidBrush (New-Color "#EFB291")
    $trimBrush = New-Object System.Drawing.SolidBrush (New-Color "#FFD46D")
    $glassBrush = New-Object System.Drawing.SolidBrush (New-Color "#FFFFFF" 165)
    $outline = [System.Drawing.Pen]::new((New-Color "#FFF9FF" 220), 7)
    $lampBrush = New-Object System.Drawing.SolidBrush (New-Color "#FFF8DD" 160)

    try {
      Fill-RoundedRect -Graphics $g -Brush $backPanelBrush -X 82 -Y 92 -Width 1372 -Height 812 -Radius 60

      foreach ($archX in @(160, 540, 920, 1200)) {
        $archPath = New-Object System.Drawing.Drawing2D.GraphicsPath
        $archPath.AddArc($archX, 164, 220, 180, 180, 180)
        $archPath.AddLine($archX + 220, 254, $archX + 220, 560)
        $archPath.AddLine($archX + 220, 560, $archX, 560)
        $archPath.AddLine($archX, 560, $archX, 254)
        $archPath.CloseFigure()
        try {
          $g.FillPath($archBrush, $archPath)
          $g.DrawPath($outline, $archPath)
        }
        finally {
          $archPath.Dispose()
        }
      }

      Fill-RoundedRect -Graphics $g -Brush $shelfBrush -X 150 -Y 562 -Width 1238 -Height 36 -Radius 18
      Fill-RoundedRect -Graphics $g -Brush $shelfBrush -X 118 -Y 766 -Width 1302 -Height 42 -Radius 20
      Fill-RoundedRect -Graphics $g -Brush $trimBrush -X 108 -Y 112 -Width 1320 -Height 26 -Radius 13
      foreach ($stand in @(
        @{ X = 208; Y = 620; Scale = 0.54 },
        @{ X = 392; Y = 620; Scale = 0.5 },
        @{ X = 578; Y = 620; Scale = 0.58 },
        @{ X = 764; Y = 620; Scale = 0.52 },
        @{ X = 950; Y = 620; Scale = 0.56 },
        @{ X = 1136; Y = 620; Scale = 0.5 },
        @{ X = 1320; Y = 620; Scale = 0.54 }
      )) {
        Draw-Cupcake -Graphics $g -CenterX $stand.X -BottomY $stand.Y -Scale $stand.Scale -Cake "#EEB06D" -Wrapper "#FFE4EF" -Cream "#FFF6FC" -Accent "#FF8DB1"
        $g.FillEllipse($glassBrush, $stand.X - (92 * $stand.Scale), $stand.Y - (176 * $stand.Scale), 184 * $stand.Scale, 152 * $stand.Scale)
      }

      foreach ($stand in @(
        @{ X = 308; Y = 842; Scale = 0.72; Accent = "#FFCB67" },
        @{ X = 608; Y = 842; Scale = 0.8; Accent = "#FF87AF" },
        @{ X = 922; Y = 842; Scale = 0.76; Accent = "#FFCC6C" },
        @{ X = 1220; Y = 842; Scale = 0.74; Accent = "#FF95B8" }
      )) {
        Draw-Cupcake -Graphics $g -CenterX $stand.X -BottomY $stand.Y -Scale $stand.Scale -Cake "#F1B26D" -Wrapper "#FFF0C8" -Cream "#FFE5F2" -Accent $stand.Accent
      }

      foreach ($lampX in @(288, 770, 1248)) {
        $g.FillEllipse($lampBrush, $lampX - 104, 86, 208, 126)
        Draw-Sparkle -Graphics $g -CenterX $lampX -CenterY 120 -Radius 12
      }
    }
    finally {
      $backPanelBrush.Dispose()
      $archBrush.Dispose()
      $shelfBrush.Dispose()
      $trimBrush.Dispose()
      $glassBrush.Dispose()
      $outline.Dispose()
      $lampBrush.Dispose()
    }

    for ($index = 0; $index -lt 24; $index++) {
      Draw-Sparkle -Graphics $g -CenterX (78 + ($index * 58)) -CenterY (136 + ($random.NextDouble() * 780)) -Radius (4 + ($random.NextDouble() * 9))
    }

    Add-Confetti -Graphics $g -Width 1536 -Height 1024 -Count 150 -Random $random
    Save-Bitmap -Bitmap $bitmap -Path $Path
  }
  finally {
    $g.Dispose()
    $bitmap.Dispose()
  }
}

$assetsDir = Join-Path $PSScriptRoot "..\\assets\\images"
if (-not (Test-Path $assetsDir)) {
  New-Item -ItemType Directory -Path $assetsDir | Out-Null
}

Render-HeroScene -Path (Join-Path $assetsDir "hero-bakery.png")
Render-OvenScene -Path (Join-Path $assetsDir "oven-stage.png")
Render-ShowcaseScene -Path (Join-Path $assetsDir "showcase-shelf.png")

Write-Output "Generated themed image set in $assetsDir"
