-- Enforce the app's upload rules (5MB; PDF, DOCX, TXT) at the Storage layer
-- too, so a client talking to Storage directly can't bypass them.
update storage.buckets
set
  file_size_limit = 5242880,
  allowed_mime_types = array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
where id = 'resumes';
