#Image formats comparison

##Introduction

This study compares 7 differents encoders, AOM AV1, BPG, JPEG XL, RAV1E, SVT-AV1, WebP and WebP2. We use five algorithms in order to compare each format:

  * SSimulacra: Structural SIMilarity Unveiling Local And Compression Related Artifacts. This is a perceptual metric designed specifically for scoring image compression related artifacts in a way that correlates well with human opinions.
  * DSSIM: Image similarity comparison simulating human perception, based on multiscale SSIM.
  * Butteraugli: project that estimates the psychovisual similarity of two images.
  * SSIM: Structural Similarity algorithm
  * MSSIM: Multi-Scale Structural Similarity algorithm
  * PSNR-HVS: Peak Signal to Noise Ratio taking into account Contrast Sensitivity Function (CSF) and between-coefficient contrast masking of DCT basis functions
  * CIEDE2000: a color-difference formula recommended by the CIE in year 2001
  * VMAF: Video Multi-Method Assessment Fusion: [http://techblog.netflix.com/2016/06/toward-practical-perceptual-video.html](http://techblog.netflix.com/2016/06/toward-practical-perceptual-video.html)

## Materials

###Image set

The image set is comprised of 49 images from [the subset 1 maintained by Xiph](https://wiki.xiph.org/Daala_Quickstart#Test_Media). All images are RGB PNG.

###Codecs

  * Alliance for Open Media AVIF: `https://github.com/AOMediaCodec/libavif`. The version used is 0.8.4.
  * AOM AV1: `https://aomedia.googlesource.com/aom/` The version used is v2.0.0.
  * AOM/Intel SVT-AV1: `https://github.com/AOMediaCodec/SVT-AV1` The version used is v0.8.6.
  * Xiph RAV1E: `https://github.com/xiph/rav1e` The version used is v0.4.0-alpha.
  * Fabrice Bellard BPG: `https://github.com/mirrorer/libbpg`. The version used is 0.9.7.
  * Mozilla JPEG: `https://github.com/mozilla/mozjpeg`. The version used is 4.0.0.
  * JPEG XL: `https://gitlab.com/wg1/jpeg-xl`. The version used is 0.1.1.
  * Google WebP: `https://chromium.googlesource.com/webm/libwebp`. The version used is 1.1.0.
  * Google WebP2: `https://chromium.googlesource.com/codecs/libwebp2/`. The version used is built from GIT revision `3724e165a6df9260eb30b9a731a9f9594d3c5703`.

###Metrics

  * The VMAF (Video Multi-Method Assessment Fusion) metric, MSSIM, SSIM, CIEDE2000 and PNSR-HVS are computed using `vmaf`, provided by Netflix: `https://github.com/Netflix/vmaf`. The version used is 2.0.0. Each metric compares two Y4M files.
  * SSImulacra: `https://github.com/cloudinary/ssimulacra` The version used is built from GIT revision `375726b13f9dec2a01950e6710e7e9f488c52ea3`.
  * DSSIM: `https://github.com/kornelski/dssim` The version used is built from GIT revision `159d623a55fe8ba9b27e381e6b30657080617678`.
  * BUtteraugli: `https://github.com/google/butteraugli` The version used is built from GIT revision `71b18b636b9c7d1ae0c1d3730b85b3c127eb4511`.

###Tools

  * `ffmpeg` is used for image formats conversion. The version used is ffmpeg 3.3.2.
  * ImageMagick `identify` is used to determine the width and height of images. The version used is ImageMagick 6.9.11-27.
  *  Python 3 timeit is used to mesure computing times.
  *  Python 3 Pandas and Numpy are used to compute means.
  *  Python 3 Matplot is used to plot graphs.

##Methods


###Image compression

All images are compressed losslessly and over a range of qualities for each codec:

  * AOM:
  
    - lossless: `avifenc --lossless --tilecolslog2 1 -c aom -s d -o [output] [input(PNG)]`
    - between q=4 and q=63: `avifenc --tilecolslog2 1 -c aom -s d --min $quality --max $quality -o [output] [input(PNG)]`
    - 
  * BPG: 
  
    - lossless: `bpgenc -m 8 -f 420 -lossless -o [output] [input(PNG)]`
    - between q=1 and q=54: `bpgenc -m 8 -f 420 -q $quality -o [output] [input(PNG)]`
  

  * JPEG XL:
  
    - lossless: `cjxl [input(PNG)] [output] -v -q $quality`
    - between q=8 and q=100: `cjxl [input(PNG)] [output] -v -q 100`
  
  * MozJPEG:
  
    - lossless: `cjpeg -rgb -quality 100 [input(PNG)] > [output]`
    - between q=5 and q=95: `cjpeg -quality $quality [input(PNG)] > [output]`

  * RAV1E:
  
    - lossless: `avifenc --lossless --tilecolslog2 1 -c rav1e -s d -o [output] [input(PNG)]`
    - between q=4 and q=63: `avifenc --tilecolslog2 1 -c rav1e -s d --min $quality --max $quality -o [output] [input(PNG)]`

  * AOM:
  
    - lossless: `avifenc --lossless --tilecolslog2 1 -c aom -s d -y 420 -o [output] [input(PNG)]`
    - between q=4 and q=63: `avifenc --tilecolslog2 1 -c aom -s d -y 420 --min $quality --max $quality -o [output] [input(PNG)]`

  * WebP:
  
    - lossless: `cwebp -mt -z 9 -lossless -o [output] [input(PNG)]`
    - between q=5 and q=95: `cwebp -mt -q $quality -o [output] [input(PNG)]`

  * WebP2:
  
    - lossless: `cwp2 -mt 2 -q $quality -o [output] [input(PNG)]`
    - between q=5 and q=95: `cwp2 -mt 2 -q 100 -o [output] [input(PNG)]`

The Python script used to generate the compressed images are available on [the GIT repository](https://github.com/eclipseo/image-comparison-sources).

###Image selection

The images which will be displayed on the website are then chosen among all compressed images, using the following criteria:

  * The BPG file at quality 24 is chosen to be the reference filesize for *large* quality images.
  * The filesize for *medium* quality images is 60% of the *large* filesize.
  * The filesize for *small* quality images is 60% of the *medium* filesize.
  * The filesize for *tiny* quality images is 60% of the *small* filesize.

The Python script used to select the compressed images are available on [the GIT repository](https://github.com/eclipseo/image-comparison-sources).


###Encoding and decoding speeds:

####Lossless compression and speed
For each codec and image, the encoding and decoding speeds for lossless compression are sampled using Python `timeit`.
The arithmetic mean of encoding and decoding speeds are calculated over the entire image set. We then determine a [Weissman score](https://en.wikipedia.org/wiki/Weissman_score) for each codec using the following formula:

$$W = \alpha {r \over \overline{r}} {\log{\overline{T}} \over \log{T}}$$

where `r` is the compression ratio over PNG filesize, `T` the time required to compress, `̅r` and `̅T` the same metrics for the standard compressor, and alpha is a scaling constant.

The standard compressor used is the compression of a JPG image using mozjpeg.

###Lossy metrics

For each codec and image, we apply the following metrics, SSimulacra, DSSIM, Butteraugli, SSIM, CIEDE2000, MSSSIM, PSNR-HVS-M and VMAF, over image samples of increasing quality. For VMAF, we use the trained model `vmaf_v0.6.1` given by Netflix.

For SSimulacra and DSSIM, Butteraugli, we first decode the compressed image to PNG then we apply the metrics over each sample, comparing it to the original image.

For SSIM, CIEDE2000, MSSSIM, PSNR-HVS-M and VMAF, on each sample, we first decode the compressed image to PNG, then export the resulting file to 4:2:0 Y4M using FFMPEG (`ffmpeg -y -i  [input] -pix_fmt yuv444p -vf scale=in_range=full:out_range=full [output]`). Finally we apply the metrics over each sample, comparing it to the original image.

For each codec, we calculate the arithmetic mean of each metric over the entire set of images, weighted by the area of the corresponding picture, for the samples of increasing quality:

$$\overline{metric}_{quality\ q} = \frac{ \sum\limits_{picture=1}^{50} metric_{qp} \times area_{p}}{\sum\limits_{p=1}^{50} area_{p}}$$

We also determine the average bits per pixel for each quality sample:

$$\overline{bpp}_{quality\ q} = \frac{ \sum\limits_{picture=1}^{50} filesize_{qp}}{\sum\limits_{picture=1}^{50} area_{p}}$$

##Results

###Raw data

The following archives contain the raw data in csv format for subset1 and subset2:

  * [Subset1](subset1.tar.gz) (updated December 2020)

###Lossless compression ratio and Weissman score:

|format |avg_bpp|avg_compression_ratio|avg_space_saving|wavg_encode_time|wavg_decode_time|weissman_score|
|:------|:-----:|:------------------:|:--------------:|:--------------:|:--------------:|:------------:|
|jxl    | 10.093|               1.3007|         0.23120|          22.648|          3.3466|        1.2555|
|webp   | 10.510|               1.2492|         0.19947|          42.614|          3.0936|        1.1343|
|webp2  | 10.397|               1.2627|         0.20805|          68.266|          5.8399|        1.0980|
|mozjpeg| 13.959|               0.9405|        -0.06330|           8.983|          0.5001|        1.0000|
|bpg    | 13.722|               0.9567|        -0.04521|          17.480|          4.2157|        0.9480|
|aom    | 11.530|               1.1386|         0.12175|         648.088|          4.9324|        0.8236|

###Lossy compression and speed

![Encoding time in function of bits per pixel](subset1.encoding_time.(avif,bpg,jxl,mozjpeg,webp,webp2).svg)

##Lossy metrics

For each comparison algorithms, we plot the quality in dB or score in function of the mean bits per pixel on a logarithmic scale. We can then visualize which codec gives the best quality at a given bit per pixel (top left is better).

###Bits per pixel at equivalent quality according to VMAF

##Bits per pixel at equivalent quality according to SSimulacra

![Bits per pixel at equivalent quality according to Y-PSNR-HVS-M](subset1.ssimulacra.(aom,bpg,jxl,mozjpeg,rav1e,svt-av1,webp,webp2).svg)

##Bits per pixel at equivalent quality according to DSSIM

![Bits per pixel at equivalent quality according to Y-PSNR-HVS-M](subset1.dssim.(aom,bpg,jxl,mozjpeg,rav1e,svt-av1,webp,webp2).svg)

##Bits per pixel at equivalent quality according to Butteraugli

![Bits per pixel at equivalent quality according to Y-PSNR-HVS-M](subset1.butteraugli.(aom,bpg,jxl,mozjpeg,rav1e,svt-av1,webp,webp2).svg)

##Bits per pixel at equivalent quality according to PSNR-HVS

![Bits per pixel at equivalent quality according to Y-PSNR-HVS-M](subset1.psnr-hvs.(aom,bpg,jxl,mozjpeg,rav1e,svt-av1,webp,webp2).svg)

##Bits per pixel at equivalent quality according to MSSSIM

![Bits per pixel at equivalent quality according to MSSSIM](subset1.ssim.(aom,bpg,jxl,mozjpeg,rav1e,svt-av1,webp,webp2).svg)

##Bits per pixel at equivalent quality according to SSIM

![Bits per pixel at equivalent quality according to SSIM]((aom,bpg,jxl,mozjpeg,rav1e,svt-av1,webp,webp2).svg)

##Bits per pixel at equivalent quality according to CIEDE2000

![Bits per pixel at equivalent quality according to CIEDE2000](subset1.ciede2000.(aom,bpg,jxl,mozjpeg,rav1e,svt-av1,webp,webp2).svg)

##Bits per pixel at equivalent quality according to VMAF

Please note that VMAF is more suitable as a video codec comparison tool, not an image one.

![Bits per pixel at equivalent quality according to VMAF](subset1.vmaf.(avif,bpg,jxl,mozjpeg,webp,webp2).svg)



