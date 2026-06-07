"use client";

import { useBalance, useReadContract } from "wagmi";
import { erc20Abi, formatUnits } from "viem";
import type { Token } from "@/types";

const NATIVE_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000";

export function isNativeToken(token: Token): boolean {
  return (
    token.address === NATIVE_TOKEN_ADDRESS ||
    token.address === "0x" ||
    token.address.toLowerCase() === NATIVE_TOKEN_ADDRESS
  );
}

interface UseTokenBalanceOptions {
  token: Token;
  address: `0x${string}` | undefined;
  watch?: boolean;
}

interface UseTokenBalanceResult {
  formattedBalance: string;
  rawBalance: bigint;
  decimals: number;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export function useTokenBalance({
  token,
  address,
  watch = true,
}: UseTokenBalanceOptions): UseTokenBalanceResult {
  const isNative = isNativeToken(token);

  const {
    data: nativeBalance,
    isLoading: isNativeLoading,
    isError: isNativeError,
    refetch: refetchNative,
  } = useBalance({
    address,
    query: {
      enabled: !!address && isNative,
      refetchInterval: watch ? 15_000 : false,
    },
  });

  const {
    data: erc20Balance,
    isLoading: isErc20Loading,
    isError: isErc20Error,
    refetch: refetchErc20,
  } = useReadContract({
    address: token.address as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !isNative,
      refetchInterval: watch ? 15_000 : false,
    },
  });

  const {
    data: erc20Decimals,
    isLoading: isDecimalsLoading,
    isError: isDecimalsError,
    refetch: refetchDecimals,
  } = useReadContract({
    address: token.address as `0x${string}`,
    abi: erc20Abi,
    functionName: "decimals",
    query: {
      enabled: !!address && !isNative,
    },
  });

  if (!address) {
    return {
      formattedBalance: "0.0000",
      rawBalance: BigInt(0),
      decimals: token.decimals,
      isLoading: false,
      isError: false,
      refetch: () => {},
    };
  }

  if (isNative) {
    return {
      formattedBalance: nativeBalance
        ? parseFloat(formatUnits(nativeBalance.value, nativeBalance.decimals)).toFixed(4)
        : "0.0000",
      rawBalance: nativeBalance?.value ?? BigInt(0),
      decimals: nativeBalance?.decimals ?? 18,
      isLoading: isNativeLoading,
      isError: isNativeError,
      refetch: refetchNative,
    };
  }

  return {
    formattedBalance: erc20Balance !== undefined
      ? parseFloat(formatUnits(erc20Balance, Number(erc20Decimals ?? token.decimals))).toFixed(4)
      : "0.0000",
    rawBalance: erc20Balance ?? BigInt(0),
    decimals: Number(erc20Decimals ?? token.decimals),
    isLoading: isErc20Loading || isDecimalsLoading,
    isError: isErc20Error || isDecimalsError,
    refetch: () => { refetchErc20(); refetchDecimals(); },
  };
}
