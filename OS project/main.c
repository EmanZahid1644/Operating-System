#include <stdio.h>
#include <stdlib.h>

#ifdef _WIN32
#include <windows.h>
#define SLEEP(ms) Sleep(ms)
#define CLEAR() system("cls")
#else
#include <unistd.h>
#define SLEEP(ms) usleep(ms * 1000)
#define CLEAR() system("clear")
#endif

#define TRACK_LEN 60   // length of disk track on screen

// draw disk track with head position
void drawTrack(int head, int disk_size) {
    int pos = (head * TRACK_LEN) / disk_size;
    if (pos >= TRACK_LEN) pos = TRACK_LEN - 1;

    printf("0 ");
    for (int i = 0; i < TRACK_LEN; i++) {
        if (i == pos)
            printf("H");
        else
            printf("-");
    }
    printf(" %d\n", disk_size - 1);
}

// smooth animation from current -> next
void animateMove(int current, int next, int disk_size) {
    int step = (current < next) ? 1 : -1;

    for (int i = current; i != next; i += step) {
        CLEAR();
        drawTrack(i, disk_size);
        SLEEP(20);
    }
    CLEAR();
    drawTrack(next, disk_size);
    SLEEP(200);
}

// FCFS
void FCFS(int req[], int n, int head, int disk_size) {
    int total = 0;
    int current = head;

    printf("\n=== FCFS ===\n");
    SLEEP(800);

    for (int i = 0; i < n; i++) {
        animateMove(current, req[i], disk_size);
        total += abs(req[i] - current);
        current = req[i];
    }

    printf("\nTotal head movement: %d\n", total);
    printf("Average head movement: %.2f\n", (float)total / n);
    SLEEP(1500);
}

// SSTF helper
int findClosest(int req[], int n, int current, int visited[]) {
    int min = 999999, idx = -1;
    for (int i = 0; i < n; i++) {
        if (!visited[i] && abs(req[i] - current) < min) {
            min = abs(req[i] - current);
            idx = i;
        }
    }
    return idx;
}

// SSTF
void SSTF(int req[], int n, int head, int disk_size) {
    int visited[n];
    for (int i = 0; i < n; i++) visited[i] = 0;

    int current = head, total = 0;

    printf("\n=== SSTF ===\n");
    SLEEP(800);

    for (int i = 0; i < n; i++) {
        int idx = findClosest(req, n, current, visited);
        visited[idx] = 1;
        animateMove(current, req[idx], disk_size);
        total += abs(req[idx] - current);
        current = req[idx];
    }

    printf("\nTotal head movement: %d\n", total);
    printf("Average head movement: %.2f\n", (float)total / n);
    SLEEP(1500);
}

// SCAN
void SCAN(int req[], int n, int head, int disk_size) {
    int left[n], right[n], l = 0, r = 0;

    for (int i = 0; i < n; i++) {
        if (req[i] < head) left[l++] = req[i];
        else right[r++] = req[i];
    }

    // sort
    for (int i = 0; i < l - 1; i++)
        for (int j = i + 1; j < l; j++)
            if (left[i] < left[j]) {
                int t = left[i]; left[i] = left[j]; left[j] = t;
            }

    for (int i = 0; i < r - 1; i++)
        for (int j = i + 1; j < r; j++)
            if (right[i] > right[j]) {
                int t = right[i]; right[i] = right[j]; right[j] = t;
            }

    int current = head, total = 0;

    printf("\n=== SCAN ===\n");
    SLEEP(800);

    for (int i = 0; i < r; i++) {
        animateMove(current, right[i], disk_size);
        total += abs(right[i] - current);
        current = right[i];
    }

    animateMove(current, disk_size - 1, disk_size);
    total += abs((disk_size - 1) - current);
    current = disk_size - 1;

    for (int i = 0; i < l; i++) {
        animateMove(current, left[i], disk_size);
        total += abs(left[i] - current);
        current = left[i];
    }

    printf("\nTotal head movement: %d\n", total);
    printf("Average head movement: %.2f\n", (float)total / n);
    SLEEP(1500);
}

// C-SCAN
void C_SCAN(int req[], int n, int head, int disk_size) {
    int left[n], right[n], l = 0, r = 0;

    for (int i = 0; i < n; i++) {
        if (req[i] < head) left[l++] = req[i];
        else right[r++] = req[i];
    }

    // sort ascending
    for (int i = 0; i < l - 1; i++)
        for (int j = i + 1; j < l; j++)
            if (left[i] > left[j]) {
                int t = left[i]; left[i] = left[j]; left[j] = t;
            }

    for (int i = 0; i < r - 1; i++)
        for (int j = i + 1; j < r; j++)
            if (right[i] > right[j]) {
                int t = right[i]; right[i] = right[j]; right[j] = t;
            }

    int current = head, total = 0;

    printf("\n=== C-SCAN ===\n");
    SLEEP(800);

    for (int i = 0; i < r; i++) {
        animateMove(current, right[i], disk_size);
        total += abs(right[i] - current);
        current = right[i];
    }

    animateMove(current, disk_size - 1, disk_size);
    total += abs((disk_size - 1) - current);
    current = disk_size - 1;

    animateMove(current, 0, disk_size);
    total += current;
    current = 0;

    for (int i = 0; i < l; i++) {
        animateMove(current, left[i], disk_size);
        total += abs(left[i] - current);
        current = left[i];
    }

    printf("\nTotal head movement: %d\n", total);
    printf("Average head movement: %.2f\n", (float)total / n);
}

// MAIN
int main() {
    int disk_size, head, n;

    printf("Enter disk size: ");
    scanf("%d", &disk_size);

    printf("Enter initial head position: ");
    scanf("%d", &head);

    printf("Enter number of requests: ");
    scanf("%d", &n);

    int req[n];
    printf("Enter requests: ");
    for (int i = 0; i < n; i++)
        scanf("%d", &req[i]);

    FCFS(req, n, head, disk_size);
    SSTF(req, n, head, disk_size);
    SCAN(req, n, head, disk_size);
    C_SCAN(req, n, head, disk_size);

    printf("\nPress Enter to exit...");
    getchar();
    getchar();
    return 0;
}
