const n=`#include <stdio.h>

void helloWorld(char* s) {
    printf("Hello %s", s);
}

int main() {
    helloWorld("C");
    return 0;
}`;export{n as default};
