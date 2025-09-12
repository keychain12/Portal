package com.example.workspaceservice.common;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

public class Test {

    public static void main(String[] args) {


        int[] arr = {1, 5, 3, 2, 3, 4, 3, 3, 2};

        System.out.println(Arrays.toString(answer(arr)));

    }

    public static int[] answer(int[] arr) {

        return Arrays.stream(arr)
                .distinct()
                .toArray();
    }

}
