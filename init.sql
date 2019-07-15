CREATE TABLE nodes (
    id        integer primary key,
    path      integer[]
);

-- node1(root)
--           ->node2
--           |  ->node5
--           |  |
--           ->node3
--           |  ->node6
--           |  |  ->node8
--           |  |  |
--           |  ->node7
--           |    ->node9
--           |       ->mode10
--           |       ->node11
--           |       ->node12
--          ->node4


INSERT INTO nodes VALUES
(1, ARRAY[1]),
(2, ARRAY[1,2]),
(3, ARRAY[1,3]),
(4, ARRAY[1,4]),
(5, ARRAY[1,2,5]),
(6, ARRAY[1,3,6]),
(7, ARRAY[1,3,7]),
(8, ARRAY[1,3,6,8]),
(9, ARRAY[1,3,7,9]),
(10, ARRAY[1,3,7,9,10]),
(11, ARRAY[1,3,7,9,11]),
(12, ARRAY[1,3,7,9,12]);
