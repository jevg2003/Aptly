Add-Type -AssemblyName System.Runtime.WindowsRuntime

# Load WinRT types explicitly to register them in PowerShell
$OcrEngineType = [Windows.Media.Ocr.OcrEngine, Windows.Media, ContentType=WindowsRuntime]
$StorageFileType = [Windows.Storage.StorageFile, Windows.Storage, ContentType=WindowsRuntime]
$FileAccessModeType = [Windows.Storage.FileAccessMode, Windows.Storage, ContentType=WindowsRuntime]
$BitmapDecoderType = [Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics.Imaging, ContentType=WindowsRuntime]
$SoftwareBitmapType = [Windows.Graphics.Imaging.SoftwareBitmap, Windows.Graphics.Imaging, ContentType=WindowsRuntime]
$OcrResultType = [Windows.Media.Ocr.OcrResult, Windows.Media, ContentType=WindowsRuntime]
$IRandomAccessStreamWithContentTypeType = [Windows.Storage.Streams.IRandomAccessStreamWithContentType, Windows.Storage, ContentType=WindowsRuntime]

function Await-WinRtOperation {
    param(
        [Parameter(Mandatory = $true)]
        $WinRtTask,
        
        [Parameter(Mandatory = $true)]
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

$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
if (-not $engine) {
    Write-Error "Could not initialize Windows OCR Engine."
    exit 1
}
Write-Host "OCR Engine: $engine"

$file = "c:\Trabajos\Aptly\QuickShare_2605251528\Screenshot_20260525_134039_Aptly.jpg"
$op = [Windows.Storage.StorageFile]::GetFileFromPathAsync($file)
$storageFile = Await-WinRtOperation $op $StorageFileType

$opStream = $storageFile.OpenAsync($FileAccessModeType::Read)
$stream = Await-WinRtOperation $opStream $IRandomAccessStreamWithContentTypeType

$opDecoder = [Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)
$decoder = Await-WinRtOperation $opDecoder $BitmapDecoderType

$opBitmap = $decoder.GetSoftwareBitmapAsync()
$bitmap = Await-WinRtOperation $opBitmap $SoftwareBitmapType

$opOcr = $engine.RecognizeAsync($bitmap)
$ocrResult = Await-WinRtOperation $opOcr $OcrResultType

Write-Host "Extracted Text: $($ocrResult.Text)"
