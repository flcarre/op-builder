import { checkinRepository } from '@crafted/database';
import type { CreateCheckInInput } from '@crafted/validators';

export async function getMemberByToken(token: string) {
  const member = await checkinRepository.findMemberByToken(token);
  if (!member) {
    throw new Error('Member not found');
  }
  return member;
}

export async function createCheckIn(input: CreateCheckInInput) {
  const member = await checkinRepository.findMemberByToken(input.token);
  if (!member) {
    throw new Error('Invalid QR code');
  }

  const checkIn = await checkinRepository.createCheckIn({
    member: { connect: { id: member.id } },
    latitude: input.latitude,
    longitude: input.longitude,
    deviceInfo: input.deviceInfo,
    checkedInAt: new Date(),
  });

  return {
    checkIn,
    member: {
      id: member.id,
      name: member.name,
      callsign: member.callsign,
      team: member.team,
    },
  };
}

export async function getCheckInsByMember(memberId: string) {
  return checkinRepository.findCheckInsByMember(memberId);
}

export async function getLatestCheckIn(memberId: string) {
  return checkinRepository.findLatestCheckIn(memberId);
}
