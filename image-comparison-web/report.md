#Image formats comparison

##Introduction

This study compares 8 differents image formats, AVIF, BPG, JPEG XL, WebP2 and WebP. We use five algorithms in order to compare each format:

  * VMAF: Video Multi-Method Assessment Fusion: [http://techblog.netflix.com/2016/06/toward-practical-perceptual-video.html](http://techblog.netflix.com/2016/06/toward-practical-perceptual-video.html)
  * SSIM: Structural Similarity algorithm
  * MSSIM: Multi-Scale Structural Similarity algorithm
  * PSNR-HVS: Peak Signal to Noise Ratio taking into account Contrast Sensitivity Function (CSF) and between-coefficient contrast masking of DCT basis functions
  * CIEDE2000: a color-difference formula recommended by the CIE in year 2001

## Materials

###Image set

The image set is comprised of 50 images from [the subset 1 and subset 2 maintened by Xiph](https://wiki.xiph.org/Daala_Quickstart#Test_Media). All images are YCbCr 4:2:0 Y4M files.

###Codecs

  * Alliance for Open Media AVIF: `https://github.com/AOMediaCodec/libavif`. The version used is built from GIT revision `e09d63b7645e12c3d0f4db4c49b0848e9782a522` (december 2020).
  * Fabrice Bellard BPG: `https://github.com/mirrorer/libbpg`. The version used is 0.9.7.
  * Mozilla JPEG: `https://github.com/mozilla/mozjpeg`. The version used is 4.0.0.
  * JPEG XL: `https://gitlab.com/wg1/jpeg-xl`. The version used is 0.1.1.
  * Google WebP: `https://chromium.googlesource.com/webm/libwebp`. The version used is 1.1.0.
  * Google WebP2: `https://chromium.googlesource.com/codecs/libwebp2/`. The version used is built from GIT revision `3724e165a6df9260eb30b9a731a9f9594d3c5703`.

###Metrics

  * The VMAF (Video Multi-Method Assessment Fusion) metric, MSSIM, SSIM, CIEDE2000 and PNSR-HVS are computed using `vmaf`, provided by Netflix: `https://github.com/Netflix/vmaf`. The version used is 2.0.0. Each metric compares two Y4M files.

###Tools

  * `ffmpeg` is used for image formats conversion. The version used is ffmpeg 3.3.2.
  * ImageMagick `identify` is used to determine the width and height of images. The version used is ImageMagick 6.9.11-27.
  *  Python 3 timeit is used to mesure computing times.
  *  Python 3 Pandas and Numpy are used to compute means.
  *  Python 3 Matplot is used to plot graphs.

##Methods

###Image conversion

Each Y4M image is exported to 4:2:0 PNG, YUV and PPM files with FFMPEG:

`ffmpeg -loglevel quiet -y -i [input] -pix_fmt yuv420p10le -strict -1 [output]`

###Image compression

All images are compressed losslessly and over a range of qualities for each codec:

  * BPG: 
  
    - lossless: `bpgenc -m 8 -f 420 -lossless -o [output] [input(PNG)]`
    - between q=1 and q=54: `bpgenc -m 8 -f 420 -q $quality -o [output] [input(PNG)]`
  
  * AVIF:
  
    - lossless: `avifenc --lossless --tilecolslog2 1 -c aom -s 4 -o  [output] [input(Y4M)]`
    - between q=4 and q=63: `avifenc --tilecolslog2 1 -c aom -s 4 --min $quality --max $quality -o [output] [input(Y4M)]`

  * JPEG XL:
  
    - lossless: `cjxl [input(PNG)] [output] -v -q $quality`
    - between q=8 and q=100: `cjxl [input(PNG)] [output] -v -q 100`
  
  * MozJPEG:
  
    - lossless: `cjpeg -rgb -quality 100 [input(PNG)] > [output]`
    - between q=5 and q=95: `cjpeg -quality $quality [input(PNG)] > [output]`

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

For each codec and image, we apply the following metrics, SSIM, CIEDE2000, MSSSIM, PSNR-HVS-M and VMAF, over image samples of increasing quality. For VMAF, we use the trained model `vmaf_v0.6.1` given by Netflix.

For each sample, we first decode the compressed image, then export the resulting file to 4:2:0 Y4M using FFMPEG (`ffmpeg -loglevel quiet -y -i [input] -pix_fmt yuv420p10le -strict -1 [output]`). Finally we apply the metrics over each sample, comparing it to the original image.

For each codec, we calculate the arithmetic mean of each metric over the entire set of images, weighted by the area of the corresponding picture, for the samples of increasing quality:

$$\overline{metric}_{quality\ q} = \frac{ \sum\limits_{picture=1}^{50} metric_{qp} \times area_{p}}{\sum\limits_{p=1}^{50} area_{p}}$$

We also determine the average bits per pixel for each quality sample:

$$\overline{bpp}_{quality\ q} = \frac{ \sum\limits_{picture=1}^{50} filesize_{qp}}{\sum\limits_{picture=1}^{50} area_{p}}$$

##Results

###Raw data

The following archives contain the raw data in csv format for subset1 and subset2:

  * [Subset1](subset1.tar.gz) (updated December 2020)

###Lossless compression ratio and Weissman score:

|codec  |avg. bits-per-pixels |avg. compression ratio|avg. space saving|wavg. encode time|wavg. decode time|Weissman score|
|:------|:-----:|:-------------------:|:--------------:|:--------------:|:--------------:|:------------:|
|jxl    |  6.317|                2.566|          0.6102|          20.764|          3.8462|        2.0517|
|webp   |  7.630|                2.124|          0.5292|          57.190|          2.9674|        1.5415|
|webp2  |  7.339|                2.208|          0.5471|          96.477|          5.8577|        1.5296|
|avif   |  8.968|                1.807|          0.4466|         152.072|          0.8917|        1.2040|
|mozjpeg| 14.224|                1.139|          0.1223|           8.584|          0.4867|        1.0000|
|bpg    | 14.107|                1.149|          0.1295|          18.193|          4.3567|        0.9311|



###Lossy compression and speed

![Encoding time in function of bits per pixel](subset1.encoding_time.(avif,bpg,jxl,mozjpeg,webp,webp2).svg)

##Lossy metrics

For each comparison algorithms, we plot the quality in dB in function of the mean bits per pixel on a logarithmic scale. We can then visualize which codec gives the best quality at a given bit per pixel (top left is better).

###Bits per pixel at equivalent quality according to VMAF

![Bits per pixel at equivalent quality according to VMAF](subset1.vmaf.(avif,bpg,jxl,mozjpeg,webp,webp2).svg)

##Bits per pixel at equivalent quality according to PSNR-HVS

![Bits per pixel at equivalent quality according to Y-PSNR-HVS-M](subset1.psnr-hvs.(avif,bpg,jxl,mozjpeg,webp,webp2).svg)

##Bits per pixel at equivalent quality according to MSSSIM

![Bits per pixel at equivalent quality according to MSSSIM](subset1.ms-ssim.(avif,bpg,jxl,mozjpeg,webp,webp2).svg)

##Bits per pixel at equivalent quality according to SSIM

![Bits per pixel at equivalent quality according to SSIM](subset1.ssim.(avif,bpg,jxl,mozjpeg,webp,webp2).svg)

##Bits per pixel at equivalent quality according to CIEDE2000

![Bits per pixel at equivalent quality according to CIEDE2000](subset1.ciede2000.(avif,bpg,jxl,mozjpeg,webp,webp2).svg)



