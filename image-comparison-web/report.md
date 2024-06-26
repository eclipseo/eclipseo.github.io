#Image formats comparison

##Introduction

This study compares 7 differents encoders, AOM AV1, HEIF X265, JPEG XL, WebP and WebP2. We use five algorithms in order to compare each format:

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

  * Alliance for Open Media AVIF: `https://github.com/AOMediaCodec/libavif`. The version used is 0.9.2.
  *   * AOM AV1: `https://aomedia.googlesource.com/aom/` The version used is v3.1.1 and git revision `70d2ea60e3ca5f11d4e153b140a72890c13b2f51`.
  * Struktur AG HEIF: `https://github.com/strukturag/libheif`. The version used is 1.12.0, with x265 3.5+1-f0c1022b6.
  * Mozilla JPEG: `https://github.com/mozilla/mozjpeg`. The version used is 4.0.3.
  * JPEG XL: `https://github.com/libjxl/libjxl`. The version used is 0.3.7 and git revision `b1f80161cfc3c0ba4024cd7d5d14bb74061ee7bf`.
  * Google WebP: `https://chromium.googlesource.com/webm/libwebp`. The version used is 1.2.0.
  * Google WebP2: `https://chromium.googlesource.com/codecs/libwebp2/`. The version used is built from GIT revision `3724e165a6df9260eb30b9a731a9f9594d3c5703` and git revision `09c86afba566d92bbef5318872c1662bf9ddec6b`.

###Metrics

  * The VMAF (Video Multi-Method Assessment Fusion) metric, MSSIM, SSIM, CIEDE2000 and PNSR-HVS are computed using `vmaf`, provided by Netflix: `https://github.com/Netflix/vmaf`. The version used is 2.2.0. Each metric compares two Y4M files.
  * SSImulacra: `https://github.com/libjxl/libjxl/tree/main/tools` The version used is built from version 0.3.7.
  * DSSIM: `https://github.com/kornelski/dssim` The version used is 3.1.0.
  * BUtteraugli: `https://github.com/libjxl/libjxl/tree/main/tools` The version used is built from  from version 0.3.7.

###Tools

  * `ffmpeg` is used for image formats conversion. The version used is ffmpeg 4.4.
  * ImageMagick `identify` is used to determine the width and height of images. The version used is ImageMagick 6.9.11-27.
  *  Python 3 timeit is used to mesure computing times.
  *  Python 3 Pandas and Numpy are used to compute means.
  *  Python 3 Matplot is used to plot graphs.

##Methods


###Image compression

All images are compressed losslessly and over a range of qualities for each codec:

  * AOM 3.1.1:
  
    - lossless: `avifenc --lossless -c aom -s d -o [output] [input(PNG)]`
    - between q=4 and q=63: `avifenc -a end-usage=q -a tune=butteraugli -a sharpness=3 --min 0 --max 63 -a cq-level=$quality -o [output] [input(PNG)]`

  * AOM 20210715:
  
    - lossless: `avifenc --lossless -c aom -s d -o [output] [input(PNG)]`
    - between q=4 and q=63: `avifenc -a end-usage=q -a tune=butteraugli -a sharpness=3 --min 0 --max 63 -a cq-level=$quality -o [output] [input(PNG)]`

  * HEIF 1.12.0:
  
    - lossless: `heif-enc -L -p chroma=444 --matrix_coefficients=0 -o [output] [input(PNG)]`
    - between q=1 and q=100: `heif-enc -p chroma=444 --matrix_coefficients=0 --quality  [output] [input(PNG)]`
  

  * JPEG XL 0.3.7:
  
    - lossless: `cjxl [input(PNG)] [output] -v -q $quality`
    - between q=8 and q=100: `cjxl [input(PNG)] [output] -v -q 100`
  

  * JPEG XL 20210715:
  
    - lossless: `cjxl [input(PNG)] [output] -v -q $quality`
    - between q=8 and q=100: `cjxl [input(PNG)] [output] -v -q 100`
  
  * MozJPEG 4.0.3:
  
    - lossless: `cjpeg -rgb -quality 100 [input(PNG)] > [output]`
    - between q=5 and q=95: `cjpeg -quality $quality [input(PNG)] > [output]`
  
  * WebP 1.2.0:
  
    - lossless: `cwebp -mt -z 9 -lossless -o [output] [input(PNG)]`
    - between q=5 and q=95: `cwebp -mt -q $quality -o [output] [input(PNG)]`

  * WebP2 20201204:
  
    - lossless: `cwp2 -mt 2 -uv_mode 2 -q 100 -o [output] [input(PNG)]`
    - between q=5 and q=95: `cwp2 -mt 2 -uv_mode 2 -q $quality -o [output] [input(PNG)]`

The Python script used to generate the compressed images are available on [the GIT repository](https://github.com/eclipseo/image-comparison-sources).

###Image selection

The images which will be displayed on the website are then chosen among all compressed images, using the following criteria:

  * The MozJPEG file at quality 85 is chosen to be the reference filesize for *large* quality images.
  * The filesize for *big* quality images is 125% of the *large* filesize.
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

  * [Subset1](subset1.tar.gz) (updated July 2021)

###Lossless compression ratio and Weissman score:

|      format       |avg_bpp|avg_compression_ratio|avg_space_saving|wavg_encode_time|wavg_decode_time|weissman_score|
|-------------------|------:|--------------------:|---------------:|---------------:|---------------:|-------------:|
|jxl_e3_20210715    | 10.549|                2.275|          0.5605|          0.4825|          0.6872|        1.3966|
|webp_z5_1.2.0      | 10.769|                2.229|          0.5513|          0.8119|          0.6263|        1.2618|
|webp_z7_1.2.0      | 10.731|                2.236|          0.5529|          2.5725|          0.6438|        1.0803|
|jxl_e5_20210715    | 10.229|                2.346|          0.5738|          4.2099|          0.6909|        1.0664|
|jxl_20210715       | 10.097|                2.377|          0.5793|          6.5659|          0.6355|        1.0257|
|webp2_20210715     | 10.266|                2.338|          0.5723|          5.8175|          1.2516|        1.0230|
|jxl_0.3.7          | 10.097|                2.377|          0.5793|          6.7333|          0.6383|        1.0228|
|png                | 13.519|                1.775|          0.4367|          0.8402|          0.8209|        1.0000|
|webp_1.2.0         | 10.508|                2.284|          0.5622|         15.5694|          0.7398|        0.8975|
|webp2_20201204     | 10.397|                2.308|          0.5668|         18.6267|          1.2856|        0.8905|
|mozjpeg            | 13.959|                1.719|          0.4184|          2.1527|          0.1256|        0.8497|
|heif_1.12.0        | 13.769|                1.743|          0.4263|          2.8206|          0.9867|        0.8322|
|jxl_e9E3I1_20210715|  9.756|                2.460|          0.5935|        151.9990|          0.6585|        0.7820|
|aom_20210715       | 11.656|                2.059|          0.5143|         92.8878|          0.9902|        0.6827|
|aom_3.1.1          | 11.657|                2.059|          0.5143|        113.1830|          1.0100|        0.6711|

###Lossy compression and speed

![Encoding time in function of bits per pixel](subset1.encoding_time.(aom_20210715,jxl_20210715,heif_1.12.0,mozjpeg,webp_1.2.0,webp2_20210715).svg)

##Lossy metrics

For each comparison algorithms, we plot the quality in dB or score in function of the mean bits per pixel on a logarithmic scale. We can then visualize which codec gives the best quality at a given bit per pixel (top left is better).

###Bits per pixel at equivalent quality according to SSimulacra

![Bits per pixel at equivalent quality according to SSimulacra](subset1.ssimulacra.(aom_20210715,jxl_20210715,heif_1.12.0,mozjpeg,webp_1.2.0,webp2_20210715).svg)

###Bits per pixel at equivalent quality according to DSSIM

![Bits per pixel at equivalent quality according to DSSIM](subset1.dssim.(aom_20210715,jxl_20210715,heif_1.12.0,mozjpeg,webp_1.2.0,webp2_20210715).svg)

###Bits per pixel at equivalent quality according to Butteraugli

![Bits per pixel at equivalent quality according to Butteraugli](subset1.butteraugli.(aom_20210715,jxl_20210715,heif_1.12.0,mozjpeg,webp_1.2.0,webp2_20210715).svg)

###Bits per pixel at equivalent quality according to PSNR-HVS

![Bits per pixel at equivalent quality according to PSNR-HVS](subset1.psnr-hvs.(aom_20210715,jxl_20210715,heif_1.12.0,mozjpeg,webp_1.2.0,webp2_20210715).svg)

###Bits per pixel at equivalent quality according to MSSSIM

![Bits per pixel at equivalent quality according to MSSSIM](subset1.ms-ssim.(aom_20210715,jxl_20210715,heif_1.12.0,mozjpeg,webp_1.2.0,webp2_20210715).svg)

###Bits per pixel at equivalent quality according to SSIM

![Bits per pixel at equivalent quality according to SSIM](subset1.ssim.(aom_20210715,jxl_20210715,heif_1.12.0,mozjpeg,webp_1.2.0,webp2_20210715).svg)

###Bits per pixel at equivalent quality according to CIEDE2000

![Bits per pixel at equivalent quality according to CIEDE2000](subset1.ciede2000.(aom_20210715,jxl_20210715,heif_1.12.0,mozjpeg,webp_1.2.0,webp2_20210715).svg)

###Bits per pixel at equivalent quality according to VMAF

Please note that VMAF is more suitable as a video codec comparison tool, not an image one.

![Bits per pixel at equivalent quality according to VMAF](subset1.vmaf.(aom_20210715,jxl_20210715,heif_1.12.0,mozjpeg,webp_1.2.0,webp2_20210715).svg)
