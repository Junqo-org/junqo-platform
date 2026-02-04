export enum ApplicationStatus {
  // The application has not been opened by the company.
  NOT_OPENED = 'NOT_OPENED',
  // The application is has been opened by the company.
  PENDING = 'PENDING',
  // The application has been rejected by the company.
  DENIED = 'DENIED',
  // The application has been accepted by the company.
  ACCEPTED = 'ACCEPTED',
  // The company has pre-accepted a candidate (expressed interest before final acceptance).
  PRE_ACCEPTED = 'PRE_ACCEPTED',
}
