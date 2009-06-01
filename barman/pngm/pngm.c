#include <stdlib.h>
#include <stdio.h>
#include <memory.h>
#include <assert.h>

typedef unsigned char u_char;
typedef int fd_t;

struct png_chunk_size_s
{
	u_char a;
	u_char b;
	u_char c;
	u_char d;
};

struct png_chunk_crc_s
{
	u_char a;
	u_char b;
	u_char c;
	u_char d;
};

#define copy_abcd(dst, src) \
dst = 0; \
dst += src.a; \
dst <<= 8; \
dst += src.b; \
dst <<= 8; \
dst += src.c; \
dst <<= 8; \
dst += src.d;


typedef struct png_chunk_size_s png_chunk_size_t;
typedef struct png_chunk_crc_s png_chunk_crc_t;

char *png_header = "\x89PNG\x0D\x0A\x1A\x0A";

static int process (char const *srcfn, char const *dstfn);
static size_t copy_bytes (FILE *dst, FILE *src,  size_t n);

int main (int argc, char const *argv[])
{
	if (argc != 3)
	{
		printf("%s\n", "Usage:\n  pngm src.png dst.png");
		return 1;
	}
	
	return process(argv[1], argv[2]);
}

int
process (char const *srcfn, char const *dstfn)
{
	FILE *src, *dst;
	
	src  = fopen(srcfn,  "rb");
	if (src == NULL)
	{
		fprintf(stderr, "ERROR: Can't open %s for reading\n", srcfn);
		return 2;
	}
	
	dst = fopen(dstfn, "wb");
	if (dst == NULL)
	{
		fprintf(stderr, "ERROR: Can't open %s for writing\n", dstfn);
		return 3;
	}
	
	u_char *header = malloc(8);
	assert(header);
	u_char *name = malloc(5);
	assert(name);
	
	if (fread(header, 8, 1, src) < 1)
	{
		fprintf(stderr, "ERROR: Can't read header from %s: %s", srcfn, header);
		return 4;
	}
	
	if (memcmp(png_header, header, 8) != 0)
	{
		fprintf(stderr, "WARNING: Invalid header in %s: %s", srcfn, header);
	}
	
	fwrite(header, 8, 1, dst);
	
	size_t i;
	png_chunk_size_t chunk_size;
	png_chunk_crc_t chunk_crc;
	size_t size;
	unsigned int crc;
	
	for (i = 0; /*void*/; ++i)
	{
		if (fread(&chunk_size, sizeof(chunk_size), 1, src) < 1)
			break;
		fwrite(&chunk_size, sizeof(chunk_size), 1, dst);
		copy_abcd(size, chunk_size);
		
		if (fread(name, 4, 1, src) < 1)
			break;
		fwrite(name, 4, 1, dst);
		name[4] = '\0';
		
		copy_bytes(dst, src, size);
		
		if (fread(&chunk_crc, sizeof(chunk_crc), 1, src) < 1)
			break;
		fwrite(&chunk_crc, sizeof(chunk_crc), 1, dst);
		copy_abcd(crc, chunk_crc);
		
		
		printf("%s %-4zd (%d %d %d %d)\n", name, size, chunk_size.a, chunk_size.b, chunk_size.c, chunk_size.d);
		fseek(src, size + 4, SEEK_CUR);
	}
	
	
	/* code */
	// printf("%s\n", "Hi!");
	return 0;
}


#define BUF_SIZE (4 * 1024)
static size_t
copy_bytes (FILE *dst, FILE *src,  size_t n)
{
	u_char *buf = malloc(BUF_SIZE);
	if (buf == NULL)
		return 0;
	
	size_t total = n, copied;
	printf("%zd\n", n);
	while (n > BUF_SIZE)
	{
		if ((copied = fread(buf, 1, BUF_SIZE, src)) < 1)
			goto DONE;
		fwrite(buf, 1, BUF_SIZE, dst);
		printf("%zd\n", copied);
		n -= copied;
	}
	
	if ((copied = fread(buf, 1, n, src)) < 1)
		goto DONE;
	fwrite(buf, 1, n, dst);
	
	DONE:
	free(buf);
	return total - n;
}