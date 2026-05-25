# ==========================================
# WINDOWS NATIVE OCR SCREENSHOT ANALYZER
# ==========================================

Add-Type -AssemblyName System.Runtime.WindowsRuntime

# Load WinRT types explicitly to register them in PowerShell
$OcrEngineType = [Windows.Media.Ocr.OcrEngine, Windows.Media, ContentType=WindowsRuntime]
$StorageFileType = [Windows.Storage.StorageFile, Windows.Storage, ContentType=WindowsRuntime]
$FileAccessModeType = [Windows.Storage.FileAccessMode, Windows.Storage, ContentType=WindowsRuntime]
$BitmapDecoderType = [Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics.Imaging, ContentType=WindowsRuntime]
$SoftwareBitmapType = [Windows.Graphics.Imaging.SoftwareBitmap, Windows.Graphics.Imaging, ContentType=WindowsRuntime]
$OcrResultType = [Windows.Media.Ocr.OcrResult, Windows.Media, ContentType=WindowsRuntime]
$IRandomAccessStreamType = [Windows.Storage.Streams.IRandomAccessStream, Windows.Storage, ContentType=WindowsRuntime]

$folderPath = "c:\Trabajos\Aptly\QuickShare_2605251528"
$outputFile = "c:\Trabajos\Aptly\scratch\ocr_results.json"

# Helper function to await IAsyncOperation<T>
function Await-WinRtOperation {
    param(
        $WinRtTask,
        [Type] $ResultType
    )

    $asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { 
        $_.Name -eq 'AsTask' -and 
        $_.GetParameters().Count -eq 1 -and 
        $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' 
    })[0]

    $asTask = $asTaskGeneric.MakeGenericMethod($ResultType)
    $netTask = $asTask.Invoke($null, @($WinRtTask))
    
    $netTask.Wait(-1) | Out-Null
    return $netTask.Result
}

# Initialize Windows OCR Engine
$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
if (-not $engine) {
    Write-Error "Could not initialize Windows OCR Engine."
    exit 1
}

Write-Host "OCR Engine initialized successfully with language: $($engine.RecognizerLanguage.LanguageTag)"

$files = Get-ChildItem -Path $folderPath -Filter "*.jpg" | Sort-Object Name
$results = @()
$count = 0

foreach ($file in $files) {
    $count++
    Write-Host "Processing ($count/$($files.Count)): $($file.Name)..."
    
    try {
        # Load file using WinRT StorageFile
        $op = [Windows.Storage.StorageFile]::GetFileFromPathAsync($file.FullName)
        $storageFile = Await-WinRtOperation $op $StorageFileType
        
        # Open stream
        $opStream = $storageFile.OpenAsync($FileAccessModeType::Read)
        $stream = Await-WinRtOperation $opStream $IRandomAccessStreamType
        
        # Decode image
        $opDecoder = [Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)
        $decoder = Await-WinRtOperation $opDecoder $BitmapDecoderType
        
        $opBitmap = $decoder.GetSoftwareBitmapAsync()
        $bitmap = Await-WinRtOperation $opBitmap $SoftwareBitmapType
        
        # Perform OCR
        $opOcr = $engine.RecognizeAsync($bitmap)
        $ocrResult = Await-WinRtOperation $opOcr $OcrResultType
        
        $text = $ocrResult.Text
        
        # Add to results
        $results += [PSCustomObject]@{
            Filename = $file.Name
            Size = $file.Length
            Text = $text
        }
        
    } catch {
        Write-Warning "Failed to perform OCR on $($file.Name): $($_.Exception.Message)"
        $results += [PSCustomObject]@{
            Filename = $file.Name
            Size = $file.Length
            Text = ""
            Error = $_.Exception.Message
        }
    }
}

# Ensure scratch directory exists
New-Item -ItemType Directory -Path "c:\Trabajos\Aptly\scratch" -Force | Out-Null

# Save results to JSON
$results | ConvertTo-Json -Depth 5 | Out-File -FilePath $outputFile -Encoding utf8
Write-Host "OCR completed successfully! Results written to $outputFile"
