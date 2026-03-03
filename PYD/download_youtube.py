 # download_youtube.py
# ✅ 기능: 유튜브 URL 입력 → (1) mp4만 / (2) mp3만 / (3) mp4+mp3 둘 다 저장
# ⚠️ 본인이 다운로드 권리가 있는 콘텐츠만 사용하세요.

from __future__ import annotations

from pathlib import Path
import sys

import yt_dlp


def ensure_dir(p: Path) -> None:
    p.mkdir(parents=True, exist_ok=True)


def build_opts(out_dir: Path, mode: str) -> dict:
    """
    mode:
      - "video" : mp4만
      - "audio" : mp3만
      - "both"  : mp4 + mp3 둘 다
    """
    ensure_dir(out_dir)

    base = {
        # 제목 기반 파일명. 너무 긴/특수문자 문제 줄임.
        "outtmpl": str(out_dir / "%(title).120s.%(ext)s"),
        "restrictfilenames": False,
        "windowsfilenames": True,
        "noplaylist": True,  # 재생목록이면 첫 영상만 (원하면 False)
        "quiet": False,
        "no_warnings": False,
    }

    if mode == "video":
        # 최고 화질(영상+음성) → mp4로 병합
        return {
            **base,
            "format": "bestvideo+bestaudio/best",
            "merge_output_format": "mp4",
        }

    if mode == "audio":
        # 오디오만 → mp3 추출
        return {
            **base,
            "format": "bestaudio/best",
            "postprocessors": [
                {
                    "key": "FFmpegExtractAudio",
                    "preferredcodec": "mp3",
                    "preferredquality": "192",
                }
            ],
        }

    if mode == "both":
        # mp4 저장 + mp3도 따로 뽑기
        return {
            **base,
            "format": "bestvideo+bestaudio/best",
            "merge_output_format": "mp4",
            "keepvideo": True,  # mp4를 남기고(mp3도 생성)
            "postprocessors": [
                {
                    "key": "FFmpegExtractAudio",
                    "preferredcodec": "mp3",
                    "preferredquality": "192",
                }
            ],
        }

    raise ValueError("mode must be one of: video, audio, both")


def run_download(url: str, out_dir: Path, mode: str) -> None:
    opts = build_opts(out_dir, mode)

    with yt_dlp.YoutubeDL(opts) as ydl:
        ydl.download([url])


def ask_mode() -> str:
    print("\n저장 방식 선택:")
    print("  1) mp4(영상)만")
    print("  2) mp3(오디오)만")
    print("  3) mp4 + mp3 둘 다")
    choice = input("선택(1/2/3): ").strip()

    if choice == "1":
        return "video"
    if choice == "2":
        return "audio"
    if choice == "3":
        return "both"

    print("❌ 잘못된 선택입니다. 1/2/3 중에서 골라주세요.")
    return ask_mode()


def main() -> None:
    print("YouTube Downloader (for content you have rights to download)")

    url = input("유튜브 URL: ").strip()
    if not url:
        print("URL이 비었습니다.")
        return

    folder = input("저장 폴더(엔터=downloads): ").strip() or "downloads"
    out_dir = Path(folder)

    mode = ask_mode()

    try:
        run_download(url, out_dir, mode)
        print(f"\n✅ 완료! 저장 위치: {out_dir.resolve()}")
        print("   (downloads 폴더를 열어서 mp4/mp3 생성 여부를 확인하세요)")
    except Exception as e:
        print("\n❌ 에러 발생:", e)
        print("\n체크리스트:")
        print(" - (venv) 활성화 상태에서 실행했나요?")
        print(" - ffmpeg -version 이 정상 출력되나요?")
        print(" - python -m pip show yt-dlp 로 설치 확인되나요?")


if __name__ == "__main__":
    main()