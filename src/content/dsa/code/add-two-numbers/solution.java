/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
 * }
 */
class Solution {
    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        ListNode head = new ListNode();
        ListNode curr = head;
        int sum = 0;
        boolean carry = false;
        while(l1 != null && l2 != null) {
            sum = l1.val + l2.val + (carry ? 1: 0);
            carry = sum > 9;
            sum %= 10;
            System.out.println(sum + " --- "+carry);
            curr.next = new ListNode(sum);
            curr = curr.next;
            l1 = l1.next;
            l2 = l2.next;
        }
        while(l1 != null) {
            sum = l1.val + (carry ? 1: 0);
            carry = sum > 9;
            sum %= 10;
            curr.next = new ListNode(sum);
            curr = curr.next;
            l1 = l1.next;
        }
        while(l2 != null) {
            sum = l2.val + (carry ? 1: 0);
            carry = sum > 9;
            sum %= 10;
            curr.next = new ListNode(sum);
            curr = curr.next;
            l2 = l2.next;
        }
        if (carry) {
            curr.next = new ListNode(1);
        }
        return head.next;
    }
}