const fs = require('fs');
let c = fs.readFileSync('src/api.ts', 'utf8');

c = c.replace(/const updateData: any = \{[\s\S]*?meetingLink, meetingDate: meetingDate \? new Date\(meetingDate\) : null, meetingNotes\n\s*\};/, `const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (realPrice !== undefined) updateData.realPrice = realPrice === '' || !realPrice ? null : parseFloat(realPrice);
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (instructorId !== undefined) updateData.instructorId = parsedInstructorId;
    if (categoryId !== undefined) updateData.categoryId = parsedCategoryId;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (isUpcoming !== undefined) updateData.isUpcoming = isUpcoming;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (language !== undefined) updateData.language = language;
    if (level !== undefined) updateData.level = level;
    if (duration !== undefined) updateData.duration = duration;
    if (expiryDate !== undefined) updateData.expiryDate = expiryDate ? new Date(expiryDate) : null;
    if (meetingLink !== undefined) updateData.meetingLink = meetingLink;
    if (meetingDate !== undefined) updateData.meetingDate = meetingDate ? new Date(meetingDate) : null;
    if (meetingNotes !== undefined) updateData.meetingNotes = meetingNotes;`);

fs.writeFileSync('src/api.ts', c);
