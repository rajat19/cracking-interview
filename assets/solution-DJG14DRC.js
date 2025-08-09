const n=`(define/contract (hello-world s)
  (-> string? void?)
    (print "Hello ~v" s)
  )`;export{n as default};
