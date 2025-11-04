#include <stdio.h>
#include <string.h>

int main(int argc, char *argv[]) {
    for (int i = 1; i < argc; i++) {
        if (strcmp(argv[i], "--version") == 0) {
            return 0;
        }
    }
    printf("--version arugment is not found in arguments (argc=%d)\n", argc);
    for (int i = 0; i < argc; i++) {
        printf("  %s\n", argv[i]);
    }
    return 1;
}
