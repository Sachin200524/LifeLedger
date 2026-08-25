import React from 'react';
import {
  UserCheck,
  Clock,
  Mail,
  Phone,
  ShieldCheck,
  Send,
  Trash2,
  FileCheck,
  Copy,
  Check
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { formatDate } from '../../utils/formatters';

export const NomineeCard = ({ nominee, onResendInvite, onDelete }) => {
  const [copied, setCopied] = React.useState(false);

  const isVerified = nominee.verificationStatus === 'VERIFIED';
  const isInvited = nominee.verificationStatus === 'INVITED';

  const copyInviteLink = () => {
    if (nominee.invitationToken) {
      const inviteUrl = `${window.location.origin}/invite/${nominee.invitationToken}`;
      navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col justify-between">
      <div>
        {/* Header with status badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-700/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-base shadow-inner">
              {nominee.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="font-bold text-white text-base leading-tight">{nominee.name}</h4>
              <span className="text-xs text-slate-400 capitalize">
                {nominee.relationship?.replace('_', ' ').toLowerCase()}
              </span>
            </div>
          </div>

          <div>
            {isVerified ? (
              <Badge variant="emerald" size="xs">
                <UserCheck className="w-3 h-3" /> Verified
              </Badge>
            ) : isInvited ? (
              <Badge variant="blue" size="xs">
                <Clock className="w-3 h-3" /> Invited
              </Badge>
            ) : (
              <Badge variant="amber" size="xs">
                Pending
              </Badge>
            )}
          </div>
        </div>

        {/* Contact info */}
        <div className="mt-4 space-y-1.5 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-slate-500" />
            <span className="truncate">{nominee.email}</span>
          </div>
          {nominee.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span>{nominee.phone}</span>
            </div>
          )}
        </div>

        {/* Policy & document stats */}
        <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 grid grid-cols-2 gap-2 text-center">
          <div>
            <span className="text-xs text-slate-400 block">Assigned Policies</span>
            <span className="text-sm font-bold text-emerald-400">{nominee.assignedPolicyCount || 0}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Status</span>
            <span className="text-xs font-semibold text-slate-300">
              {isVerified ? `Verified ${formatDate(nominee.verifiedAt)}` : 'Awaiting confirmation'}
            </span>
          </div>
        </div>

        {/* Notes */}
        {nominee.notes && (
          <p className="mt-3 text-xs text-slate-400 italic bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/50">
            "{nominee.notes}"
          </p>
        )}
      </div>

      {/* Footer action buttons */}
      <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
        {!isVerified ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onResendInvite(nominee.id)}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3 h-3 text-emerald-400" /> Resend Invite
            </button>
            {nominee.invitationToken && (
              <button
                onClick={copyInviteLink}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 transition-colors"
                title="Copy verification link"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Link'}
              </button>
            )}
          </div>
        ) : (
          <span className="text-xs text-emerald-400/80 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Identity Verified
          </span>
        )}

        <button
          onClick={() => onDelete(nominee.id)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          title="Remove Nominee"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
