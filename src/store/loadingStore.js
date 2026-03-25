import { create } from "zustand";

export const useLoading = create((set) => ({
    isLoading: false,
    setIsLoading: async (loading) => {
        if (loading) {
            set({ isLoading: true });
        } else {
            // คืนค่าเป็น Promise เพื่อให้ตัวเรียกใช้สามารถ await จนกว่าจะหน่วงเวลาเสร็จได้
            return new Promise((resolve) => {
                setTimeout(() => {
                    set({ isLoading: false });
                    resolve();
                }, 500);
            });
        }
    },
}));
