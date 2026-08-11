const fs = require('fs');
let content = fs.readFileSync('src/api.ts', 'utf8');

const eventOld = `  const { title, description, date, endDate, expiryDate, totalSeats, availableSeats, price, realPrice, location, imageUrl, translations, meetingLink, meetingDate, meetingNotes, notifyEnrolled, isActive } = req.body;
  const event = await prisma.event.update({
    where: { id: req.params.id },
    data: {
      isActive: isActive !== undefined ? isActive : true,
      title, description, date: new Date(date), 
      endDate: endDate ? new Date(endDate) : null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      totalSeats: totalSeats ? parseInt(totalSeats) : 0,
      availableSeats: availableSeats !== undefined ? parseInt(availableSeats) : undefined,
      price: parseFloat(price), 
      realPrice: realPrice !== undefined && realPrice !== null ? parseFloat(realPrice) : null,
      location, imageUrl,
      meetingLink, meetingDate: meetingDate ? new Date(meetingDate) : null, meetingNotes
    }
  });`;

const eventNew = `  const { title, description, date, endDate, expiryDate, totalSeats, availableSeats, price, realPrice, location, imageUrl, translations, meetingLink, meetingDate, meetingNotes, notifyEnrolled, isActive } = req.body;
  const updateData: any = {};
  if (isActive !== undefined) updateData.isActive = isActive;
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (date !== undefined) updateData.date = new Date(date);
  if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
  if (expiryDate !== undefined) updateData.expiryDate = expiryDate ? new Date(expiryDate) : null;
  if (totalSeats !== undefined) updateData.totalSeats = parseInt(totalSeats);
  if (availableSeats !== undefined) updateData.availableSeats = parseInt(availableSeats);
  if (price !== undefined) updateData.price = parseFloat(price);
  if (realPrice !== undefined) updateData.realPrice = realPrice !== null ? parseFloat(realPrice) : null;
  if (location !== undefined) updateData.location = location;
  if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
  if (meetingLink !== undefined) updateData.meetingLink = meetingLink;
  if (meetingDate !== undefined) updateData.meetingDate = meetingDate ? new Date(meetingDate) : null;
  if (meetingNotes !== undefined) updateData.meetingNotes = meetingNotes;
  
  const event = await prisma.event.update({
    where: { id: req.params.id },
    data: updateData
  });`;

content = content.replace(eventOld, eventNew);

fs.writeFileSync('src/api.ts', content);
