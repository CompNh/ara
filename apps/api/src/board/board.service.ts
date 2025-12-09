export interface Timestamp {
  seconds: number;
  nanos?: number;
}

export interface BoardPost {
  id: string | number;
  title: string;
  content: string;
  createdAt: Timestamp;
}

export interface BoardDetailQueryParams {
  postId: string | number;
  start_time?: Timestamp;
  end_time?: Timestamp;
}

const toMilliseconds = ({ seconds, nanos = 0 }: Timestamp): number => {
  if (!Number.isFinite(seconds) || !Number.isFinite(nanos)) {
    throw new Error("Timestamp 값이 올바른 숫자가 아닙니다.");
  }

  return seconds * 1000 + Math.floor(nanos / 1_000_000);
};

const requireTimestamp = (
  value: Timestamp | undefined,
  field: "start_time" | "end_time",
): Timestamp => {
  if (!value) throw new Error(`${field} 값이 누락되었습니다.`);
  return value;
};

/**
 * 게시판 글 상세 조회.
 *
 * start_time/end_time 쿼리 파라미터를 필수로 요구하며 Timestamp 스키마로 검증한다.
 * 요청 구간(start_time~end_time) 안에 생성된 게시글만 반환하며, 범위를 벗어나면 null을 돌려준다.
 */
export const getBoardPostDetail = (
  posts: BoardPost[],
  query: BoardDetailQueryParams,
): BoardPost | null => {
  const startTime = requireTimestamp(query.start_time, "start_time");
  const endTime = requireTimestamp(query.end_time, "end_time");

  const startMs = toMilliseconds(startTime);
  const endMs = toMilliseconds(endTime);

  if (startMs > endMs) {
    throw new Error("start_time 은 end_time 보다 이후일 수 없습니다.");
  }

  const target = posts.find(({ id }) => String(id) === String(query.postId));
  if (!target) return null;

  const createdMs = toMilliseconds(target.createdAt);
  return createdMs >= startMs && createdMs <= endMs ? target : null;
};
