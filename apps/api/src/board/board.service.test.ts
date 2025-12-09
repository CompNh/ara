import { describe, expect, it } from "vitest";
import { BoardPost, getBoardPostDetail } from "./board.service";

const makeTimestamp = (seconds: number) => ({ seconds });

const samplePosts: BoardPost[] = [
  {
    id: 1,
    title: "첫 번째 글",
    content: "본문",
    createdAt: makeTimestamp(1_700_000_000),
  },
  {
    id: "latest",
    title: "최신 글",
    content: "내용",
    createdAt: makeTimestamp(1_800_000_000),
  },
];

describe("getBoardPostDetail", () => {
  it("start_time 없이 호출하면 에러를 던진다", () => {
    expect(() =>
      getBoardPostDetail(samplePosts, {
        postId: 1,
        end_time: makeTimestamp(1_900_000_000),
      }),
    ).toThrow(/start_time/);
  });

  it("end_time 없이 호출하면 에러를 던진다", () => {
    expect(() =>
      getBoardPostDetail(samplePosts, {
        postId: 1,
        start_time: makeTimestamp(1_600_000_000),
      }),
    ).toThrow(/end_time/);
  });

  it("지정한 기간 내의 게시글을 찾아 반환한다", () => {
    const result = getBoardPostDetail(samplePosts, {
      postId: "latest",
      start_time: makeTimestamp(1_700_000_000),
      end_time: makeTimestamp(1_900_000_000),
    });

    expect(result?.title).toBe("최신 글");
  });

  it("기간을 벗어나면 null을 반환한다", () => {
    const result = getBoardPostDetail(samplePosts, {
      postId: 1,
      start_time: makeTimestamp(1_800_000_001),
      end_time: makeTimestamp(1_900_000_000),
    });

    expect(result).toBeNull();
  });
});
