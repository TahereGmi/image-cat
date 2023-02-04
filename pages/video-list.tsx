import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getVideoList, selectedValue } from '../store/reducers/videoListReducer'
import { IVideoResult } from '../types/videoList'
import styles from '../styles/VideoList.module.scss'

const VideoList = () => {
  const [activeVideo, setActiveVideo] = useState(-1)
  const dispatch = useDispatch()
  const videoResult = useSelector(selectedValue) as IVideoResult
  const videoRefs = useRef([] as React.MutableRefObject<HTMLVideoElement>[])
  const videoWrapperRef = useRef<null | HTMLDivElement>(null)
  const { loaded, loading, result: videos } = videoResult

  useEffect(() => {
      (async () => {
          await dispatch(getVideoList())
      })()
  }, [dispatch])

  const handleIntersection = (entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      const videoIndex = videoRefs.current.findIndex(ref => ref.current === entry.target)
      if (entry.isIntersecting) {
        setActiveVideo(videoIndex)
      }
    })
  }

  useEffect(() => {
    if (window.IntersectionObserver) {
      const observer = new IntersectionObserver(handleIntersection, {
        root: videoWrapperRef.current,
        rootMargin: '-95px 0px',
        threshold: [1]
      })
      videoRefs.current.forEach(ref => observer.observe(ref.current!))
      return () => observer.disconnect()
    } else {
      setActiveVideo(-1)
    }
  }, [videoRefs.current.length])

  useEffect(() => {
    videoRefs.current.forEach((ref, index) => {
      if (index === activeVideo) {
        ref.current.play()
      } else {
        ref.current.pause()
      }
    })
  }, [activeVideo])

  return (
  <div 
    ref={videoWrapperRef}
    className={styles.videosWrapper}
  >
      {loading && <div>Loading...</div>}
      {loaded && videos.map((video, index) => (
        <video
          key={video.id}
          ref={(el: HTMLVideoElement) => {
            videoRefs.current[index]= {current: el}
          }}
          src={video.attributes.preview_src}
          className={styles.videoSource}
          muted
          controls
        />
      ))}
    </div>
  )
}

export default VideoList

