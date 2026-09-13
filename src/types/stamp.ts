import { DojangTourStatus } from "./festival";

export type MyTourStamp = {
  festivalId: string;
  title: string;
  imageUrl?: string;
  stampCount: number;
  eventEndDate: string;
  status: DojangTourStatus;
}

export type StampDetailItem = {
  title: string;
  completedAt: string;
};

export type MyTourStampDetail = {
  festivalId: string;
  festivalImgUrl: string;
  tourName: string;
  stampCount: number;
  stamps: StampDetailItem[];
  status: DojangTourStatus;
}

export type TourStampListResult = {
  rewardedTourCount: number;
  tours: MyTourStamp[];
};

export type RewardQrResult = {
  qrCodeImageUrl: string;
};