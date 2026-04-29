# Forum FE API

## Base

- Base path: `/api/v1`
- Response envelope: `ApiResponse<T>` with `data` payload
- Most interaction endpoints require authenticated user.

## Posts

- `GET /posts?pageNumber=1&pageSize=20`  
  Lấy danh sách bài viết forum cho trang list.

- `GET /posts/{postId}`  
  Lấy chi tiết một bài viết cho trang detail.

- `POST /posts/{postId}/vote`  
  Vote bài viết.
  - Body:
    ```json
    {
      "voteType": 1
    }
    ```
  - `voteType`: `1` (upvote), `2` (downvote)

- `POST /posts/{postId}/bookmark`  
  Lưu bài viết.

- `DELETE /posts/{postId}/bookmark`  
  Bỏ lưu bài viết.

- `POST /posts/{postId}/report`  
  Report bài viết.
  - Body:
    ```json
    {
      "reason": 2,
      "description": "Reported from forum detail UI"
    }
    ```

## Comments

- `GET /posts/{postId}/comments?pageNumber=1&pageSize=20`  
  Lấy danh sách comment của bài viết.
  - FE hiện gọi với `pageSize=30` tại forum detail để giảm số lần phân trang trong UI compact.

- `POST /comments/posts/{postId}`  
  Tạo comment mới.
  - Body:
    ```json
    {
      "content": "Nội dung bình luận",
      "parentCommentId": null
    }
    ```

## Notes

- FE hiện map `authorName` theo fallback từ `authorId` nếu API comments chưa trả profile join.
- Seed dữ liệu forum đã được bổ sung để local có sẵn post/comment phục vụ test UI detail.
- Cache refresh dùng RTK Query invalidation tags (`ForumPost`, `Comment`) cho các luồng comment/vote/bookmark/report để đồng bộ list/detail.
