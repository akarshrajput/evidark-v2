import { useState, useEffect, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

export function useInfiniteScroll({
  queryKey,
  queryFn,
  getNextPageParam,
  enabled = true,
  staleTime = 5 * 60 * 1000,
  cacheTime = 10 * 60 * 1000,
}) {
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey,
    queryFn,
    getNextPageParam,
    enabled,
    staleTime,
    cacheTime,
  });

  // Intersection Observer for infinite scroll
  const lastElementRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (isFetchingNextPage) return;
      if (!hasNextPage) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
            setIsFetchingNextPage(true);
            fetchNextPage().finally(() => {
              setIsFetchingNextPage(false);
            });
          }
        },
        {
          threshold: 0.1,
          rootMargin: '100px',
        }
      );

      if (node) observer.observe(node);

      return () => {
        if (node) observer.unobserve(node);
      };
    },
    [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  // Flatten pages data
  const flatData = data?.pages?.flatMap((page) => page.data || page) || [];

  return {
    data: flatData,
    error,
    isLoading,
    isError,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    lastElementRef,
    fetchNextPage,
  };
}

export default useInfiniteScroll;
